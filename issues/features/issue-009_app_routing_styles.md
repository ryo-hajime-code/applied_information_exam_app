# Issue-009: App.tsx・ルーティング・グローバルスタイルの設定

## 概要
`src/App.tsx` に React Router v6 を使ったルーティングを設定し、`src/index.css` にグローバルスタイルを定義する。
2画面（Home: `/`、RecordList: `/records`）のルーティングと、アプリ全体の基本スタイルを整える。

## タスク
- [ ] `src/App.tsx` を実装する
  - `BrowserRouter` + `Routes` + `Route` でルーティングを設定
  - `/` → `Home` コンポーネント
  - `/records` → `RecordList` コンポーネント
  - それ以外は `/` にリダイレクト
- [ ] `src/main.tsx` を確認・調整する（`StrictMode` はそのまま残す）
- [ ] `src/index.css` にグローバルスタイルを定義する
  - CSSリセット（`box-sizing: border-box`、`margin: 0`、`padding: 0`）
  - カラー変数（`--color-primary: #007AFF` 等）をCSS変数として定義
  - フォント設定
  - 背景色: #F2F2F7
  - モバイルファースト: 最大幅600px、中央寄せ（PC時）
- [ ] 画面遷移アニメーション（スライドイン右から左、0.3秒）を実装する

## 完了条件
- `/` にアクセスすると Home 画面が表示される
- `/records` にアクセスすると RecordList 画面が表示される
- グローバルなCSSカラー変数が定義されている
- `npm run dev` でエラーなく動作する

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-013, Issue-014

## 備考
- この時点では Home と RecordList は仮実装（空コンポーネント）でよい
- CSS変数で色を一元管理することで、後のスタイル変更が容易になる