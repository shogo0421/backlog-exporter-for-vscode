# Backlog Exporter for VS Code

Backlog のプロジェクトデータ（課題・Wiki・ドキュメント）をマークダウンファイルとしてローカルに保存する VS Code / Cursor 拡張機能です。

エクスポートしたデータを `@workspace` で AI に読み込ませることで、Backlog の情報を自然言語で検索・質問できるようになります。

---

## 機能

- **Export All** — 課題・Wiki・ドキュメントを一括エクスポート
- **Export Issues** — 課題のみエクスポート
- **Export Wiki** — Wiki ページをエクスポート
- **Export Documents** — ドキュメントをエクスポート
- **Update** — 前回エクスポート以降の差分のみ更新

---

## インストール

[Releases](https://github.com/shogo0421/backlog-exporter-for-vscode/releases) ページから `.vsix` ファイルをダウンロードし、以下のコマンドでインストールします。

```bash
# VS Code
code --install-extension backlog-exporter-for-vscode-0.1.0.vsix

# Cursor
cursor --install-extension backlog-exporter-for-vscode-0.1.0.vsix
```

または拡張機能パネル（`⌘⇧X`）の `...` メニューから **Install from VSIX...** を選択してください。

---

## 使い方

### 1. サイドバーを開く

アクティビティバーの Backlog アイコンをクリックするとパネルが開きます。

### 2. 設定を入力する

| 項目        | 内容                                                     |
| ----------- | -------------------------------------------------------- |
| **Domain**  | Backlog のドメイン（例: `yourspace.backlog.jp`）         |
| **Project** | プロジェクト ID またはキー（例: `MY_PROJECT`）           |
| **API Key** | Backlog の API キー                                      |
| **出力先**  | エクスポート先ディレクトリ（デフォルト: `backlog-data`） |

各行の鉛筆アイコンをクリックすると編集できます。設定は自動的に保存されるため **2 回目以降は入力不要**です。

> **API キーの保存先**
> API キーは VS Code の SecretStorage（macOS では Keychain）に暗号化して保存されます。`settings.json` には記録されません。

### 3. エクスポートを実行する

ボタンをクリックするだけでエクスポートが開始されます。実行中はボタンが無効化され、進捗がリアルタイムに表示されます。

### 4. 出力先について

- **相対パス** — ワークスペースルートを基点にします（例: `backlog-data`）
- **絶対パス** — そのまま使用されます（例: `/Users/yourname/backlog`）
- **`~/` パス** — ホームディレクトリに展開されます（例: `~/backlog`）

CLI でエクスポート済みのディレクトリがある場合は、出力先をそのディレクトリに変更することで **Update** コマンドが差分更新として機能します。

---

## API キーの取得方法

1. Backlog にログイン
2. 右上のアイコン → **個人設定**
3. **API** タブ → **APIキーを発行する**

---

## コマンドパレット

サイドバー以外からも実行できます。`⌘⇧P` で以下のコマンドが利用可能です。

| コマンド                    | 内容                       |
| --------------------------- | -------------------------- |
| `Backlog: Export All`       | 全データをエクスポート     |
| `Backlog: Export Issues`    | 課題をエクスポート         |
| `Backlog: Export Wiki`      | Wiki をエクスポート        |
| `Backlog: Export Documents` | ドキュメントをエクスポート |
| `Backlog: Update`           | 差分更新                   |

---

## 設定

VS Code の設定（`settings.json`）から変更できます。

| 設定キー                          | デフォルト       | 内容                       |
| --------------------------------- | ---------------- | -------------------------- |
| `backlogExporter.domain`          | `""`             | Backlog ドメイン           |
| `backlogExporter.projectIdOrKey`  | `""`             | プロジェクト ID またはキー |
| `backlogExporter.outputDirectory` | `"backlog-data"` | 出力ディレクトリ           |

---

## 動作要件

- VS Code 1.85.0 以上（または Cursor）
- Node.js（拡張機能に同梱）

---

## ライセンス

MIT
