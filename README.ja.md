[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — VS Code 向け LLM ルーターとモデルプロバイダー

いつもの開発環境はそのままに、背後で動くモデルを選べます。

Swobu ルートを VS Code のネイティブモデルとして使うか、公式 UI を維持したまま Claude Code と Codex を接続できます。プロバイダーとフォールバックを Swobu で一度設定すれば、モデルが変わっても同じルートを選び続けられます。

[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu) から拡張機能をインストールするか、VS Code で `swobu.swobu` を検索してください。1 つのプラットフォーム非依存パッケージで、ローカル、WSL、Remote SSH、Dev Container の拡張機能ホストに対応します。

## VS Code でモデルを使う

**Manage Language Models** を開き、**Swobu** とルートを選択します。プロバイダーの選択とフォールバックは Swobu が管理します。VS Code Agent 用のツール呼び出しは既定で有効です。

## Claude Code と Codex をそのまま使う

**Swobu: Connect Claude Code** または **Swobu: Connect Codex** を実行し、ワークスペースを選んで公式 UI で作業を続けます。設定変更と安全な置換は既存の Swobu 接続コマンドが担当します。

## なぜルートなのか

プロバイダー切り替えはエディター内のモデルを変更します。ルートなら、同じモデル選択の背後で処理先やフォールバックを変更できます。クライアントを維持し、プロバイダーの判断を Swobu に任せます。

## はじめに

1. **Swobu: Set Up** でモデルへの接続を設定します。
2. 開発作業用のルートを作成します。
3. **Manage Language Models** でルートを選び、Agent にファイルの読み取りを依頼します。
4. **Swobu: Open** で実際のルーティング結果を確認します。

## モデル設定

**Swobu: Configure Model** でルートを選びます。画像とツール呼び出しには **Default**、**On**、**Off** があります。コンテキストと出力にはプリセット、または正の整数によるカスタム値を使えます。**Reset overrides** は再起動せず直ちに既定値へ戻します。

既定値はツール有効、画像無効、入力 32,768 トークン、出力 4,096 トークンです。これは利用者が設定するクライアント向けの能力表示であり、モデルの自動検出ではありません。画像対応モデルを使うルートでのみ画像を有効にしてください。

## プロバイダーと仕組み

OpenRouter、Ollama、Bedrock、Azure、OpenAI 互換エンドポイントなどの利用可能なモデルを Swobu で設定します。認証情報は Swobu に保持されます。VS Code はローカルの Swobu プロセスへリクエストを送信し、Swobu が接続、再試行、フォールバック、使用量を管理します。拡張機能はルートをモデルとして表示し、応答をストリーミングします。

## プライバシーとセキュリティ

リクエスト、応答、ツール内容は一時的に拡張機能のメモリを通過します。拡張機能はそれらを保存・記録せず、独自のテレメトリアップローダーも持ちません。Swobu プロセスには Swobu 自身のプライバシー設定が適用されます。[PRIVACY.md](PRIVACY.md) と [SECURITY.md](SECURITY.md) を参照してください。

## Remote、WSL、コンテナー

拡張機能はワークスペースの拡張機能ホストで動作します。ループバックの接続先はそのホストです。リモートワークスペースではリモート側に Swobu を設定してください。パッケージ検証とインストールテストがリリースの前提です。

## トラブルシューティング

ルート変更後は **Swobu: Refresh Models** を使います。接続できない場合はマシン単位のエンドポイント設定を確認します。設定の置換を許可する前に接続コマンドの出力を確認してください。

[問題を報告](https://github.com/swobuforge/swobu-vscode/issues)する際は VS Code のバージョン、プラットフォーム、エラーメッセージを記載し、認証情報や非公開のリクエスト内容は除いてください。

## 開発とライセンス

Node 22、VS Code 1.135 以降で `npm ci`、`npm test`、`npm run build`、`npm run package` を実行します。互換性のある通常の Swobu インストールがある場合は `npm run test:integration` も実行し、画面のない Linux では `xvfb-run -a` を付けます。

拡張機能のソースは [MIT](LICENSE)。Swobu は別途インストール、ライセンスされ、VSIX に Swobu 実行ファイルは含まれません。Swobu は Microsoft、Anthropic、OpenAI と提携していません。
