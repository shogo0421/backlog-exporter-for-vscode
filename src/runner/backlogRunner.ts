import * as cp from 'node:child_process'
import path from 'node:path'
import * as vscode from 'vscode'

export type BacklogCommand = 'all' | 'document' | 'issue' | 'update' | 'wiki'

export interface RunOptions {
  apiKey: string
  command: BacklogCommand
  domain: string
  outputDir: string
  projectIdOrKey: string
}

/**
 * 依存パッケージ `backlog-exporter` の CLI エントリ `bin/run.js` の絶対パスを返す。
 */
function resolveRunScript(): string {
  return path.join(
    // webpack が CommonJS を出力するため実行時は __dirname が有効
    // eslint-disable-next-line unicorn/prefer-module -- extension bundle は CJS
    __dirname,
    '..',
    'node_modules',
    'backlog-exporter',
    'bin',
    'run.js',
  )
}

export function runBacklogExporter(
  options: RunOptions,
  outputChannel: vscode.OutputChannel,
  progress: vscode.Progress<{message?: string}>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const runScript = resolveRunScript()
    const nodeExec = process.execPath

    const args: string[] = [runScript, options.command]

    if (options.command === 'update') {
      args.push(options.outputDir, '--force', '--domain', options.domain, '--projectIdOrKey', options.projectIdOrKey)
    } else {
      args.push('--domain', options.domain, '--projectIdOrKey', options.projectIdOrKey, '--output', options.outputDir)
    }

    const displayArgs = args.slice(1).join(' ')
    outputChannel.appendLine(`> backlog-exporter ${displayArgs} --apiKey ****`)
    outputChannel.show(true)

    // 別プロセスで `backlog-exporter` を実行
    const child = cp.spawn(nodeExec, args, {
      env: {...process.env, BACKLOG_API_KEY: options.apiKey},
    })

    let lineBuffer = ''
    const stderrLines: string[] = []

    child.stdout.on('data', (data: Buffer) => {
      lineBuffer += data.toString().replaceAll('\r', '\n')
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.trim()) {
          outputChannel.appendLine(line)
          progress.report({message: line.slice(0, 80)})
        }
      }
    })

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString().replaceAll('\r', '\n')
      for (const line of text.split('\n')) {
        if (line.trim()) {
          outputChannel.appendLine(`[ERROR] ${line}`)
          stderrLines.push(line.trim())
        }
      }
    })

    child.on('close', (code) => {
      if (lineBuffer.trim()) {
        outputChannel.appendLine(lineBuffer)
      }

      if (code === 0 && stderrLines.length === 0) {
        outputChannel.appendLine(`[backlog-exporter] 完了しました`)
        resolve()
      } else if (stderrLines.length > 0) {
        const msg = stderrLines.find((l) => !l.startsWith('›')) ?? stderrLines[0]
        reject(new Error(msg))
      } else {
        reject(new Error(`backlog-exporter がコード ${code} で終了しました。出力チャンネルをご確認ください。`))
      }
    })

    child.on('error', (err) => {
      outputChannel.appendLine(`[ERROR] プロセスの起動に失敗しました: ${err.message}`)
      reject(err)
    })
  })
}
