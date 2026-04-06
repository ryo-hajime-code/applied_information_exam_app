# Issue-021: 結合テスト — RecordList画面

## 概要

RecordList 画面の結合テストを Vitest + React Testing Library で実装する。
一覧表示・削除フロー（ConfirmDialog 操作を含む）・画面遷移の各シナリオをカバーする。

テスト環境（パッケージ・setup.ts・`renderWithRouter` ヘルパー）は Issue-019 で整備済みであることを前提とする。

---

## タスク

### 1. RecordList画面 — 一覧表示フロー

**ファイル**: `src/pages/RecordList.integration.test.tsx`

- [ ] LocalStorage に記録がある状態でアクセスすると、`RecordCard` が記録数分描画される
- [ ] 平均正答率・総演習回数が正しく表示される
- [ ] LocalStorage が空の状態でアクセスすると、「まだ記録がありません」が表示される

> **Issue-018との棲み分け**: `calculateComparisons` を含む計算ロジックの正しさは Issue-018 でカバー済み。ここでは平均正答率・総演習回数が画面に描画されること（値の存在）のみを検証し、計算値の精度検証は行わない。

### 2. RecordList画面 — 削除フロー

**ファイル**: `src/pages/RecordList.integration.test.tsx`（上記と同ファイル）

- [ ] 削除ボタンをクリックし ConfirmDialog で確認すると、その記録が一覧から消え LocalStorage からも削除され、トースト「記録を削除しました」が表示される

> **粒度の方針**: MVP の個人開発では ConfirmDialog の細かい状態遷移（キャンセル・全件削除後の空表示など）を個別のテストケースに分けると、UI の小変更でテストが壊れやすくなる。削除の主要フロー（ボタン→確認→削除→Toast）を1本で通すことを優先し、キャンセル動作や空状態表示は手動確認で代替する。

### 3. RecordList → Home 画面遷移

**ファイル**: `src/pages/RecordList.integration.test.tsx`（上記と同ファイル）

- [ ] 「← 戻る」ボタンをクリックすると、前の画面（`/`）に戻る
- [ ] 空状態の「ホームに戻る」ボタンをクリックすると、`/` に遷移し Home 画面が描画される

---

## 実装指針

### renderWithRouter の使い方

Issue-019 で作成した `src/test/renderWithRouter.tsx` を import して使う。
`navigate(-1)` のテストは `initialEntries` に 2 つのパスを渡してシミュレートする。

```ts
// 「戻る」ボタンのテスト例
renderWithRouter(['/', '/records']);
// /records から始まり、戻るボタンで / に戻ることを検証する
```

### LocalStorage の初期化

各テストの `beforeEach` で `clearAllData()` を呼び、テスト間の状態汚染を防ぐ。
テストデータの投入には `createRecord()` を使う。

```ts
beforeEach(() => {
  clearAllData();
});
```

### 非同期処理

- Toast は `setTimeout` で非表示になるため、`findByText` で出現を待つ
- ConfirmDialog の表示・非表示も `findByRole('dialog')` / `queryByRole('dialog')` で検証する
- `userEvent.setup()` を使い、`click` の非同期操作を正しく扱う

### styled-components の考慮

`styled-components` が生成するクラス名は動的なため、テスト内では `getByRole` / `getByText` / `data-testid` でクエリする。クラス名によるセレクタは使用しない。

---

## 完了条件

- `npm test` で全テストケースがパスする
- RecordList 画面の主要フロー（一覧表示・削除・画面遷移）がカバーされている
- 各テストの `beforeEach` で LocalStorage がクリアされており、テスト間で状態が汚染されない

---

## 依存関係

- 依存するIssue: Issue-014（RecordList ページの実装完了）、Issue-019（テスト環境構築・`renderWithRouter` ヘルパー）
- このIssueに依存するIssue: なし
