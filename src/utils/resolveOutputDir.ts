import * as os from 'node:os'
import path from 'node:path'

/**
 * 出力ディレクトリ(絶対パス)を解決する関数
 * @param workspaceFolder ワークスペースフォルダ
 * @param outputDirectory 出力ディレクトリ
 * @param subDir サブディレクトリ
 * @returns 正規化された出力ディレクトリの絶対パス
 */
export function resolveOutputDir(workspaceFolder: string, outputDirectory: string, subDir?: string): string {
  const dir = outputDirectory.trim() || 'backlog-data'
  const expanded = dir.startsWith('~') ? path.join(os.homedir(), dir.slice(1)) : dir

  const base = path.isAbsolute(expanded) ? path.resolve(expanded) : path.resolve(workspaceFolder, expanded)

  return subDir ? path.resolve(base, subDir) : base
}
