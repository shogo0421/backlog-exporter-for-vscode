import * as vscode from 'vscode'

import {ConfigManager} from '../config/configManager'
import {BacklogCommand, runBacklogExporter} from '../runner/backlogRunner'
import {resolveOutputDir} from '../utils/resolveOutputDir'
import {getPanelHtml} from './panelHtml'

export class PanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'backlogExporter.panel'
  private _apiKeyVisible = false
  private _running = false
  private _view?: vscode.WebviewView

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly configManager: ConfigManager,
    private readonly outputChannel: vscode.OutputChannel,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    }

    webviewView.webview.html = this._getHtml(webviewView.webview)

    // Extension → Webview: push current config on show
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this._pushConfig()
      }
    })
    this._pushConfig()

    // Webview → Extension: handle messages
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'changeApiKey': {
          await this._changeApiKey()
          break
        }

        case 'changeDomain': {
          await this._changeSetting('domain', 'Backlog domain (例: yourspace.backlog.jp)', 'yourspace.backlog.jp')
          break
        }

        case 'changeOutputDirectory': {
          await this._changeSetting(
            'outputDirectory',
            '出力ディレクトリ (ワークスペースルートからの相対パス)',
            'backlog-data',
          )
          break
        }

        case 'changeProject': {
          await this._changeSetting('projectIdOrKey', 'プロジェクト ID またはキー', 'MY_PROJECT')
          break
        }

        case 'exportAll': {
          await this._runExportAll()
          break
        }

        case 'exportDocuments': {
          await this._runExport('document', 'documents')
          break
        }

        case 'exportIssues': {
          await this._runExport('issue', 'issues')
          break
        }

        case 'exportWiki': {
          await this._runExport('wiki', 'wiki')
          break
        }

        case 'openOutputChannel': {
          this.outputChannel.show()
          break
        }

        case 'toggleApiKey': {
          await this._toggleApiKeyVisibility()
          break
        }

        case 'update': {
          await this._runUpdate()
          break
        }
      }
    })

    // Reflect config changes in real time
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('backlogExporter')) {
        this._pushConfig()
      }
    })
  }

  private async _changeApiKey(): Promise<void> {
    const current = await this.configManager.getApiKey()
    const input = await vscode.window.showInputBox({
      ignoreFocusOut: false,
      password: !this._apiKeyVisible,
      prompt: '新しい Backlog API キーを入力してください',
      value: current,
    })
    if (input) {
      await this.configManager.setApiKey(input)
      if (this._apiKeyVisible) {
        this._post({type: 'apiKey', value: input, visible: true})
      }

      vscode.window.showInformationMessage('API キーを更新しました。')
    }
  }

  private async _changeSetting(
    key: 'domain' | 'outputDirectory' | 'projectIdOrKey',
    prompt: string,
    placeholder: string,
  ): Promise<void> {
    const current = this.configManager.getConfig()[key]
    const input = await vscode.window.showInputBox({
      ignoreFocusOut: false,
      placeHolder: placeholder,
      prompt,
      value: current,
    })
    if (input !== undefined) {
      await vscode.workspace.getConfiguration('backlogExporter').update(key, input, vscode.ConfigurationTarget.Global)
      this._pushConfig()
    }
  }

  private async _ensureWorkspace(): Promise<string | undefined> {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!folder) {
      vscode.window.showErrorMessage('エクスポートするにはワークスペースフォルダを開いてください。')
    }

    return folder
  }

  private _getHtml(webview: vscode.Webview): string {
    return getPanelHtml(webview, this.extensionUri)
  }

  private _post(message: Record<string, unknown>): void {
    this._view?.webview.postMessage(message)
  }

  private _pushConfig(): void {
    const cfg = this.configManager.getConfig()
    this._post({domain: cfg.domain, outputDirectory: cfg.outputDirectory, project: cfg.projectIdOrKey, type: 'config'})
  }

  private async _runExport(command: BacklogCommand, subDir: string): Promise<void> {
    if (this._running) {
      return
    }

    const exportSettings = await this.configManager.ensureExportSettings()
    if (!exportSettings) {
      return
    }

    const workspaceFolder = await this._ensureWorkspace()
    if (!workspaceFolder) {
      return
    }

    const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory, subDir)

    this._setRunning(true)
    this._post({text: `${command} のエクスポートを開始...`, type: 'log'})

    try {
      await runBacklogExporter(
        {
          apiKey: exportSettings.apiKey,
          command,
          domain: exportSettings.domain,
          outputDir,
          projectIdOrKey: exportSettings.projectIdOrKey,
        },
        this.outputChannel,
        {
          report: (p) => {
            if (p.message) {
              this._post({text: p.message, type: 'log'})
            }
          },
        },
      )
      const now = new Date().toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})
      this._post({text: `完了 (${now})`, type: 'done'})
      vscode.window.showInformationMessage(`Backlog: ${command} のエクスポートが完了しました。`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      this._post({text: msg, type: 'error'})
      this._showError(error)
    } finally {
      this._setRunning(false)
      this._pushConfig()
    }
  }

  private async _runExportAll(): Promise<void> {
    if (this._running) {
      return
    }

    const exportSettings = await this.configManager.ensureExportSettings()
    if (!exportSettings) {
      return
    }

    const workspaceFolder = await this._ensureWorkspace()
    if (!workspaceFolder) {
      return
    }

    const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory)

    this._setRunning(true)
    this._post({text: '全データのエクスポートを開始...', type: 'log'})

    try {
      await runBacklogExporter(
        {
          apiKey: exportSettings.apiKey,
          command: 'all',
          domain: exportSettings.domain,
          outputDir,
          projectIdOrKey: exportSettings.projectIdOrKey,
        },
        this.outputChannel,
        {
          report: (p) => {
            if (p.message) {
              this._post({text: p.message, type: 'log'})
            }
          },
        },
      )
      const now = new Date().toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})
      this._post({text: `完了 (${now})`, type: 'done'})
      vscode.window.showInformationMessage('Backlog: 全データのエクスポートが完了しました。')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      this._post({text: msg, type: 'error'})
      this._showError(error)
    } finally {
      this._setRunning(false)
    }
  }

  private async _runUpdate(): Promise<void> {
    if (this._running) {
      return
    }

    const exportSettings = await this.configManager.ensureExportSettings()
    if (!exportSettings) {
      return
    }

    const workspaceFolder = await this._ensureWorkspace()
    if (!workspaceFolder) {
      return
    }

    const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory)

    this._setRunning(true)
    this._post({text: 'データの更新を開始...', type: 'log'})

    try {
      await runBacklogExporter(
        {
          apiKey: exportSettings.apiKey,
          command: 'update',
          domain: exportSettings.domain,
          outputDir,
          projectIdOrKey: exportSettings.projectIdOrKey,
        },
        this.outputChannel,
        {
          report: (p) => {
            if (p.message) {
              this._post({text: p.message, type: 'log'})
            }
          },
        },
      )
      const now = new Date().toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})
      this._post({text: `更新完了 (${now})`, type: 'done'})
      vscode.window.showInformationMessage('Backlog: データの更新が完了しました。')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      this._post({text: msg, type: 'error'})
      vscode.window.showErrorMessage(`Backlog 更新失敗: ${msg}`)
    } finally {
      this._setRunning(false)
    }
  }

  private _setRunning(running: boolean): void {
    this._running = running
    this._post({type: 'running', value: running})
  }

  private _showError(err: unknown): void {
    const raw = err instanceof Error ? err.message : String(err)
    // Extract the first meaningful line (skip stack traces and exit code lines)
    const firstLine = raw.split('\n').find((l) => l.trim() && !l.startsWith('    at ')) ?? raw
    vscode.window.showErrorMessage(firstLine, {modal: true})
  }

  private async _toggleApiKeyVisibility(): Promise<void> {
    this._apiKeyVisible = !this._apiKeyVisible
    if (this._apiKeyVisible) {
      const key = await this.configManager.getApiKey()
      this._post({type: 'apiKey', value: key ?? '', visible: true})
    } else {
      this._post({type: 'apiKey', value: null, visible: false})
    }
  }
}
