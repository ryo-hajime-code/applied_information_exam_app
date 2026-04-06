# Issue-020: 結合テスト — Home画面

## 概要

Home 画面の結合テストを Vitest + React Testing Library で実装する。
「記録追加→LocalStorage保存→Toast表示→前回比表示」という一連のユーザーフローと、
Home→RecordList への画面遷移を検証する。

テスト環境（パッケージ・setup.ts・`renderWithRouter` ヘルパー）は Issue-019 で整備済みであることを前提とする。

### 結合テストと画面遷移について

ボタンクリックによる画面遷移（`useNavigate`）は、Router とページコンポーネントの連携であるため**結合テストの対象範囲に含まれる**。
`MemoryRouter` を使うことでブラウザなしでルーティングをシミュレートし、遷移後の描画内容を検証できる。

---

## タスク

### 1. Home画面 — 記録追加フロー

**ファイル**: `src/pages/Home.integration.test.tsx`

- [ ] 問題数・正答数を入力して「記録する」ボタンをクリックすると、LocalStorage に記録が保存される
- [ ] 記録保存後にトースト「記録を追加しました ✓」が表示される
- [ ] 初回記録（前回なし）の場合、`ComparisonDisplay`（前回比）は表示されない
- [ ] 記録が2件以上ある場合、記録追加後に `ComparisonDisplay` が表示される

> **Issue-018との棲み分け**: `createRecord → getSortedRecords → calculateComparisons` パイプラインのロジック正しさは Issue-018 でカバー済み。ここでは「前回比がUIに表示される／されない」という描画の有無のみを検証する。計算値の正確性は検証対象外。

### 2. Home → RecordList 画面遷移

**ファイル**: `src/pages/Home.integration.test.tsx`（上記と同ファイル）

- [ ] 「記録を見る」ボタンをクリックすると、`/records` へ遷移し RecordList 画面が描画される

---

## 実装指針

### LocalStorage の初期化

各テストの `beforeEach` で `clearAllData()` を呼び、テスト間の状態汚染を防ぐ。

```ts
beforeEach(() => {
  clearAllData();
});
```

### 非同期処理・アニメーション

- Toast は `setTimeout` で非表示になるため、`waitFor` または `findByText` で出現を待つ
- `userEvent.setup()` を使い、`click` / `type` の非同期操作を正しく扱う（v14 以降は `userEvent.click()` の直接呼び出しは非推奨）

### styled-components の考慮

`styled-components` が生成するクラス名は動的なため、テスト内では `getByRole` / `getByText` / `data-testid` でクエリする。クラス名によるセレクタは使用しない。

---

## 完了条件

- `npm test` で全テストケースがパスする
- Home 画面の主要フロー（記録追加・前回比・画面遷移）がカバーされている
- 各テストの `beforeEach` で LocalStorage がクリアされており、テスト間で状態が汚染されない

---

## 依存関係

- 依存するIssue: Issue-013（Home ページの実装完了）、Issue-019（テスト環境構築）
- このIssueに依存するIssue: なし
