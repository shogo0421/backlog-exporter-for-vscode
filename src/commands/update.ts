import * as vscode from 'vscode'

import {ConfigManager} from '../config/configManager'
import {runBacklogExporter} from '../runner/backlogRunner'
import {resolveOutputDir} from '../utils/resolveOutputDir'

export async function update(configManager: ConfigManager, outputChannel: vscode.OutputChannel): Promise<void> {
  const exportSettings = await configManager.ensureExportSettings()
  if (!exportSettings) {
    return
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('更新するにはワークスペースフォルダを開いてください。')
    return
  }

  // update scans for .backlog-exporter-settings.json files under this directory
  const outputDir = resolveOutputDir(workspaceFolder, exportSettings.outputDirectory)

  await vscode.window.withProgress(
    {
      cancellable: false,
      location: vscode.ProgressLocation.Notification,
      title: 'Backlog: データを更新中...',
    },
    async (progress) => {
      try {
        await runBacklogExporter(
          {
            apiKey: exportSettings.apiKey,
            command: 'update',
            domain: exportSettings.domain,
            outputDir,
            projectIdOrKey: exportSettings.projectIdOrKey,
          },
          outputChannel,
          progress,
        )
        vscode.window.showInformationMessage('Backlog: データの更新が完了しました。')
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        vscode.window.showErrorMessage(`Backlog 更新失敗: ${msg}`)
      }
    },
  )
}
