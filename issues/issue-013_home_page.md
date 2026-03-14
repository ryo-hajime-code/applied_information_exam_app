# Issue-013: Home画面の実装

## 概要
`src/pages/Home.tsx` に、アプリのメイン画面であるホーム画面を実装する。
カウントダウン・記録入力フォーム・前回比表示・記録一覧への遷移ボタンを統合し、記録追加のエンドツーエンドフローを完成させる。

## タスク
- [ ] `src/pages/Home.tsx` を実装する
  - ローカルstate: `records`, `examDate`, `comparison`, `toast`
  - `useEffect` でマウント時に `getAllRecords()` と `getSettings()` を呼んで初期化する
- [ ] `CountDown` コンポーネントを組み込む（`examDate`, `onExamDateChange`）
- [ ] `RecordForm` コンポーネントを組み込む（`onSubmit` ハンドラ）
- [ ] 記録追加ハンドラ `handleSubmit` を実装する
  1. 保存前に `getLatestRecord()` で前回記録を取得
  2. `createRecord()` で保存
  3. `calculateComparison()` で前回比を計算
  4. `setComparison()` で状態を更新
  5. トースト通知「記録を追加しました ✓」を表示（2秒で消去）
- [ ] `ComparisonDisplay` コンポーネントを組み込む（`comparison` が null でない場合のみ表示）
- [ ] 「記録を見る」ボタン（セカンダリ）を組み込み、`/records` へ遷移する
- [ ] `Toast` コンポーネントを組み込む

## 完了条件
- フォームに入力して「記録する」を押すと LocalStorage に保存され、前回比が表示される
- トースト通知が2秒後に消える
- 「記録を見る」ボタンで `/records` に遷移する
- 受験日の設定・変更ができる

## 依存関係
- 依存するIssue: Issue-002, Issue-003, Issue-006, Issue-009, Issue-010, Issue-011, Issue-012
- このIssueに依存するIssue: なし

## 備考
- 設計書（05_api-design.md）セクション7.1の実装例を参照
- `createRecord()` 後に `getLatestRecord()` を呼ぶと自分自身が返るため、**必ず保存前に前回記録を取得する**こと