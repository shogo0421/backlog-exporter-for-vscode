import * as vscode from 'vscode'

import {ConfigManager} from '../config/configManager'
import {runBacklogExporter} from '../runner/backlogRunner'
import {resolveOutputDir} from '../utils/resolveOutputDir'

export async function exportIssues(configManager: ConfigManager, outputChannel: vscode.OutputChannel): Promise<void> {
  const exportSettings = await configManager.ensureExportSettings()
  if (!exportSettings) {
    return
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('エクスポートするにはワークスペースフォルダを開いてください。')
    return
  }

  const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory, 'issues')

  await vscode.window.withProgress(
    {
      cancellable: false,
      location: vscode.ProgressLocation.Notification,
      title: 'Backlog: Issues をエクスポート中...',
    },
    async (progress) => {
      try {
        await runBacklogExporter(
          {
            apiKey: exportSettings.apiKey,
            command: 'issue',
            domain: exportSettings.domain,
            outputDir,
            projectIdOrKey: exportSettings.projectIdOrKey,
          },
          outputChannel,
          progress,
        )
        vscode.window.showInformationMessage('Backlog: Issues のエクスポートが完了しました。')
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        vscode.window.showErrorMessage(`Backlog エクスポート失敗: ${msg}`)
      }
    },
  )
}
