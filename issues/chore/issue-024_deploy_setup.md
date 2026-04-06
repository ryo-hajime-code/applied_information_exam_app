# Issue-024: デプロイ設定（Vercel / Netlify）

## 概要
アプリを Vercel または Netlify に継続的デプロイする設定を行う。
GitHub へのプッシュで自動デプロイが実行される環境を構築し、HTTPS で公開できる状態にする。

## タスク
- [ ] GitHub リポジトリを作成する（まだであれば）
- [ ] `npm run build` でビルドが成功することを確認する（エラーがないこと）
- [ ] 以下のいずれかでデプロイを設定する（推奨: Vercel）
  - **Vercel**: Vercel ダッシュボードで GitHub リポジトリを連携、フレームワーク「Vite」を選択
  - **Netlify**: Netlify ダッシュボードで GitHub リポジトリを連携、ビルドコマンド `npm run build`、公開ディレクトリ `dist`
- [ ] プッシュ後の自動デプロイが動作することを確認する
- [ ] 公開URLでアプリが正常に動作することを確認する（HTTPS、LocalStorage動作確認）
- [ ] SPA ルーティング対応の設定を追加する（`_redirects` または `vercel.json`）
  - Netlify: `public/_redirects` に `/* /index.html 200` を追加
  - Vercel: デフォルトで対応済み

## 完了条件
- GitHub へのプッシュで自動デプロイが実行される
- 公開URL（HTTPS）でアプリが正常に動作する
- `/records` に直接アクセスしても 404 にならない（SPAルーティング対応）

## 依存関係
- 依存するIssue: Issue-013, Issue-014, Issue-023
- このIssueに依存するIssue: なし

## 備考
- 設計書（02_architecture.md）セクション9のデプロイ手順を参照
- Vercel / Netlify どちらも無料枠で運用可能
- 個人情報を扱わないため、環境変数の設定は不要