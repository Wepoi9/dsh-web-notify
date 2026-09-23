# dsh-web-notify

DeepSeek Harness（DSH）Web UI 用の双方向プラグイン。セッションの完了・エラー・操作待ちを OS 通知（ブラウザ Notification API）で知らせます。DSH `0.1.6-alpha.2` で動作確認済み。`0.1.7-alpha.2` ではプラグイン読み込み・一覧表示・テスト通知を確認済みです（後続バージョンの互換性は保証しません。`0.1.6-alpha.2` より前は対象外です）。

## 動作

- ホスト側: `sessionProjections.register` で `notifyTurn` プロジェクションを登録。`turn/start` の turn 番号と一致した `turn/end` の `reason.kind` を state `{ openTurn, last: { turn, reason } }` に fold し、wire view は `last` を返す
- クライアント側: session list / session status / panel state を監視し、以下の条件で OS 通知を発火
  - 非表示セッションの turn が `completed` / `blocked` / `error` で終了
  - セッションが待機状態（`approval` / `question` / `plan-review`）になった
- 通知テキストは DSH のセッション表示名＋短い状態のみ（LLM 出力・コマンド・フルパスは含めない）
- セッション表示名は OS の通知センターやロック画面に表示される場合があります。明示タイトルがない場合、DSH 側で作業ディレクトリ名やセッション ID から表示名が生成されることがあります
- 通知をクリックすると該当セッションが開く

## 抑制・重複排除

- `max-tokens` / `aborted` / `interrupted` の turn 終了は通知しない
- subagent セッション（`origin === 'subagent'`）は通知しない（クライアント側判定）
- ページが visible・focused・会話表示中で、かつそのセッションがメインビューにある場合は通知しない
- 重複排除: セッションごとの turn 番号、待機 `interaction.key`（待機解決でクリア）。ページ読み込み直後の初回観測は通知せずに記録する
- 同一更新で複数のアクションがある場合は 1 件の集約通知にする（例: `DSH · 3件の更新` / `1件の操作待ち、2件の完了`）。クリック先は最優先セッション（待機アクション優先）
- permission が `granted` のときのみ発火

## 設定

- `Settings → General → ブラウザ通知`: `Notification.permission` を表示。「デフォルト」なら「許可をリクエスト」ボタン、「許可済み」なら「テスト通知」ボタンを表示
- 許可の取り下げはブラウザのサイト設定で行います

## 導入

プラグインディレクトリを DSH profile に追加します（ローカルディレクトリ形式）:

```
dsh plugin --profile web add <プラグインディレクトリのパス>
```

その後 DSH Web を再起動します（`dsh --profile web --host 127.0.0.1 --port 3080`）。

## ビルド

```
npm run build
```

`lib/client.js` を再生成します（esbuild で CJS バンドルを `__ModuleLoader__.load` にラップ、`react` / `react/jsx-runtime` は external）。クライアントソースを変更した後は必ず再ビルドしてから再起動してください。

## 確認

```
npm run check
npm test
```

DSH `0.1.7-alpha.2` では、プラグイン読み込み・一覧表示・テスト通知を確認済みです。実セッション終了・エラー・操作待ちからの通知発火は未確認です。

## 制約

- Notification API の permission 付与が必要（ブラウザの origin ごとに管理）
- 通知はページが読み込まれ接続が生存している間のみ発火します（Notification API はオフライン非対応）
- ホスト側は plain JavaScript（zod 依存のみ）

## ライセンス

MIT License。詳細は [LICENSE](LICENSE) を参照してください。
