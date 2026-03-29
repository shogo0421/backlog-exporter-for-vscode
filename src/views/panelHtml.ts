import * as fs from 'node:fs'
import path from 'node:path'
import * as vscode from 'vscode'

/**
 * `media/panel.html` を読み、codicon / パネル用 CSS・JS の webview URI を埋め込んだ HTML 文字列を返す。
 */
export function getPanelHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const root = extensionUri.fsPath
  const htmlPath = path.join(root, 'media', 'panel.html')
  const html = fs.readFileSync(htmlPath, 'utf8')

  const codiconCss = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css'))
    .toString()
  const panelCss = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'panel.css')).toString()
  const panelJs = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'panel.js')).toString()

  return html
    .replaceAll('__CODICON_CSS_URI__', codiconCss)
    .replaceAll('__PANEL_CSS_URI__', panelCss)
    .replaceAll('__PANEL_JS_URI__', panelJs)
}
