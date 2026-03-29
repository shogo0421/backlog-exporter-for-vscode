import * as vscode from 'vscode'

const API_KEY_SECRET = 'backlogExporter.apiKey'

/** エクスポート／更新の実行に必要な設定（ドメイン・プロジェクト・API キー・出力先）。 */
export interface BacklogExportSettings {
  apiKey: string
  domain: string
  outputDirectory: string
  projectIdOrKey: string
}

export class ConfigManager {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  /**
   * 未設定項目があれば入力を促し、エクスポート用の設定をそろえる。
   * キャンセル時は undefined。
   */
  async ensureExportSettings(): Promise<BacklogExportSettings | undefined> {
    const cfg = this.getConfig()
    const globalConfig = vscode.workspace.getConfiguration('backlogExporter')

    let {domain, outputDirectory, projectIdOrKey} = cfg

    if (!domain) {
      const input = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        placeHolder: 'yourspace.backlog.jp',
        prompt: 'Backlog domain を入力してください (例: yourspace.backlog.jp)',
      })
      if (!input) {
        return undefined
      }

      await globalConfig.update('domain', input, vscode.ConfigurationTarget.Global)
      domain = input
    }

    if (!projectIdOrKey) {
      const input = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        placeHolder: 'MY_PROJECT',
        prompt: 'Backlog プロジェクト ID またはキーを入力してください',
      })
      if (!input) {
        return undefined
      }

      await globalConfig.update('projectIdOrKey', input, vscode.ConfigurationTarget.Global)
      projectIdOrKey = input
    }

    let apiKey = await this.getApiKey()
    if (!apiKey) {
      const input = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        password: true,
        prompt: 'Backlog API キーを入力してください',
      })
      if (!input) {
        return undefined
      }

      await this.setApiKey(input)
      apiKey = input
    }

    return {apiKey, domain, outputDirectory, projectIdOrKey}
  }

  async getApiKey(): Promise<string | undefined> {
    return this.secrets.get(API_KEY_SECRET)
  }

  getConfig() {
    const cfg = vscode.workspace.getConfiguration('backlogExporter')
    return {
      domain: cfg.get<string>('domain', ''),
      outputDirectory: cfg.get<string>('outputDirectory', 'backlog-data'),
      projectIdOrKey: cfg.get<string>('projectIdOrKey', ''),
    }
  }

  async setApiKey(apiKey: string): Promise<void> {
    return this.secrets.store(API_KEY_SECRET, apiKey)
  }
}
