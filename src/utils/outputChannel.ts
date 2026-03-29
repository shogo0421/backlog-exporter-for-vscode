import * as vscode from 'vscode'

let channel: undefined | vscode.OutputChannel

export function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Backlog Exporter')
  }

  return channel
}
