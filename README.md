# Backlog Exporter for VS Code

Backlog のデータをエクスポートするためのVS Code / Cursor 拡張機能

CLIツールのbacklog-exporter(https://github.com/ShuntaToda/backlog-exporter) をVSCode/Cursor拡張機能にしたものです。

エクスポートしたデータを、Copilot や Cursor などの AI ツールから参照して、コンテキストとして活用できます。

<img src="https://github.com/shogo0421/backlog-exporter-for-vscode/blob/main/media/images/demo.png?raw=true" />

---

## 機能

- **Export All** — 課題・Wiki・ドキュメントを一括エクスポート
- **Export Issues** — 課題のみエクスポート
- **Export Wiki** — Wiki ページをエクスポート
- **Export Documents** — ドキュメントをエクスポート
- **Update** — 前回エクスポート以降の差分のみ更新

拡張の各機能に対応する CLI の例は次のとおりです。

| 機能                 | CLI（例）                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export All**       | `backlog-exporter all --domain example.backlog.jp --projectIdOrKey PROJECT_KEY --output /absolute-path/backlog-data --apiKey ****`                |
| **Export Issues**    | `backlog-exporter issue --domain example.backlog.jp --projectIdOrKey PROJECT_KEY --output /absolute-path/backlog-data/issues --apiKey ****`       |
| **Export Wiki**      | `backlog-exporter wiki --domain example.backlog.jp --projectIdOrKey PROJECT_KEY --output /absolute-path/backlog-data/wiki --apiKey ****`          |
| **Export Documents** | `backlog-exporter document --domain example.backlog.jp --projectIdOrKey PROJECT_KEY --output /absolute-path/backlog-data/documents --apiKey ****` |
| **Update**           | `backlog-exporter update /absolute-path/backlog-data --force --apiKey ****`                                                                       |

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

各行の鉛筆アイコンをクリックすると編集できます。設定は自動的に保存されます。

> **API キーの保存先**  
> API キーは VS Code の SecretStorage（macOS では Keychain）に暗号化して保存されます。

### 3. エクスポートを実行する

ボタンをクリックしてエクスポートを開始します。実行中はボタンが無効化され、進捗がリアルタイムに表示されます。

### 4. 出力先について

- **相対パス** — ワークスペースルートを基点にします（例: `backlog-data`）
- **絶対パス** — そのまま使用されます（例: `/Users/yourname/backlog`）
- **`~/` パス** — ホームディレクトリに展開されます（例: `~/backlog`）

CLI でエクスポート済みのディレクトリがある場合は、出力先をそのディレクトリに変更することで **Update** ボタンから差分更新が可能です。

---

## ドメインとプロジェクトキーの取得方法

1. Backlog のプロジェクトページに移動
2. URLをコピー

```
https://example.backlog.jp/projects/PROJECT1
```

- ドメイン: example.backlog.jp
- プロジェクトキー: PROJECT1

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

## 出力形式

出力されるファイルの形式については、CLIツール `backlog-exporter` の README をご確認ください。

- [backlog-exporter README - 出力形式](https://github.com/ShuntaToda/backlog-exporter/blob/main/README.md#%E5%87%BA%E5%8A%9B%E5%BD%A2%E5%BC%8F)

---

## ライセンス

MIT
