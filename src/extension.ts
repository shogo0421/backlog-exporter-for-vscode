import * as vscode from 'vscode'

import {exportAll} from './commands/exportAll'
import {exportDocuments} from './commands/exportDocuments'
import {exportIssues} from './commands/exportIssues'
import {exportWiki} from './commands/exportWiki'
import {update} from './commands/update'
import {ConfigManager} from './config/configManager'
import {getOutputChannel} from './utils/outputChannel'
import {PanelViewProvider} from './views/panelViewProvider'

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = getOutputChannel()
  const configManager = new ConfigManager(context.secrets)

  const provider = new PanelViewProvider(context.extensionUri, configManager, outputChannel)

  context.subscriptions.push(
    outputChannel,
    vscode.window.registerWebviewViewProvider(PanelViewProvider.viewId, provider, {
      webviewOptions: {retainContextWhenHidden: true},
    }),
    // Keep command palette commands as well
    vscode.commands.registerCommand('backlogExporter.exportIssues', () => exportIssues(configManager, outputChannel)),
    vscode.commands.registerCommand('backlogExporter.exportWiki', () => exportWiki(configManager, outputChannel)),
    vscode.commands.registerCommand('backlogExporter.exportDocuments', () =>
      exportDocuments(configManager, outputChannel),
    ),
    vscode.commands.registerCommand('backlogExporter.exportAll', () => exportAll(configManager, outputChannel)),
    vscode.commands.registerCommand('backlogExporter.update', () => update(configManager, outputChannel)),
  )
}

export function deactivate(): void {}
