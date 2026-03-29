import * as vscode from 'vscode'

import {ConfigManager} from '../config/configManager'
import {runBacklogExporter} from '../runner/backlogRunner'
import {resolveOutputDir} from '../utils/resolveOutputDir'

export async function exportAll(configManager: ConfigManager, outputChannel: vscode.OutputChannel): Promise<void> {
  const exportSettings = await configManager.ensureExportSettings()
  if (!exportSettings) {
    return
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('エクスポートするにはワークスペースフォルダを開いてください。')
    return
  }

  const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory)

  await vscode.window.withProgress(
    {
      cancellable: false,
      location: vscode.ProgressLocation.Notification,
      title: 'Backlog: 全データをエクスポート中...',
    },
    async (progress) => {
      try {
        await runBacklogExporter(
          {
            apiKey: exportSettings.apiKey,
            command: 'all',
            domain: exportSettings.domain,
            outputDir,
            projectIdOrKey: exportSettings.projectIdOrKey,
          },
          outputChannel,
          progress,
        )
        vscode.window.showInformationMessage('Backlog: 全データのエクスポートが完了しました。')
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        vscode.window.showErrorMessage(`Backlog エクスポート失敗: ${msg}`)
      }
    },
  )
}
