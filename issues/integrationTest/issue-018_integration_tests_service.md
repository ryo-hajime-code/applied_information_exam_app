# Issue-018: 結合テスト — サービス層データフロー

## 概要

`validation → calculator → storage` の連携を検証する結合テストを Vitest で実装する。
ユニットテスト（Issue-015〜017）は各サービスの「単体の正しさ」を保証するが、
「バリデーションを通過した入力が正答率計算されて正しく保存されるか」「削除後に前回比の再計算が正しいか」
といったサービス間の連携は本 Issue で初めて検証される。

UI（React）に依存しない純粋な TS テストのため、React Testing Library は不要。
Issue-019（テスト環境構築）とは独立して実施できる。

---

## タスク

### 1. validateRecord → createRecord パイプライン

**ファイル**: `src/services/service.integration.test.ts`

- [ ] 有効な入力を `validateRecord()` → `createRecord()` の順で渡すと、`rate` が `calculateRate()` で正しく計算されて保存される
  - 例: `{ date: "2026-04-07", total: 50, correct: 42 }` → `rate === 84.0`
- [ ] `validateRecord()` がエラーを返した場合、`createRecord()` を呼ばずに済む（バリデーション失敗で保存が防げる）ことを確認する
  - 例: `total: 0` → `valid: false` → `getSortedRecords()` が空のまま

### 2. createRecord → getSortedRecords → calculateComparisons パイプライン

**ファイル**: `src/services/service.integration.test.ts`（上記と同ファイル）

- [ ] 複数件を `createRecord()` で保存した後に `getSortedRecords()` を呼ぶと、日付降順・同日 `createdAt` 降順で返る
- [ ] `getSortedRecords()` の結果を `calculateComparisons()` に渡すと、正しい前回比の配列が得られる
  - 最新レコードの前回比は前のレコードとの差分になる
  - 最古レコードの前回比は `null`
- [ ] 中間のレコードを `deleteRecord()` した後に `getSortedRecords()` → `calculateComparisons()` を再実行すると、隣接レコードの前回比が正しく再計算される

### 3. validateSettings → updateSettings → getSettings パイプライン

**ファイル**: `src/services/service.integration.test.ts`（上記と同ファイル）

- [ ] 有効な将来日付を `validateSettings()` → `updateSettings()` の順で渡すと、`getSettings()` で同じ値が取得できる
- [ ] `null` を `updateSettings()` で保存すると、`getSettings()` で `{ examDate: null }` が返る
- [ ] `validateSettings()` がエラーを返した場合（過去日付・不正形式）、`updateSettings()` を呼ばずに済む（保存が防げる）ことを確認する

### 4. getAverageRate / getTotalCount の連携確認

**ファイル**: `src/services/service.integration.test.ts`（上記と同ファイル）

- [ ] 複数件保存後に `getAverageRate()` が各レコードの `rate` の平均値（小数第1位）を返す
- [ ] `deleteRecord()` 後に `getAverageRate()` / `getTotalCount()` が削除後の件数で再計算される

---

## 実装指針

### LocalStorage の初期化

各テストの `beforeEach` で `clearAllData()` を呼び、テスト間の状態汚染を防ぐ。

```ts
beforeEach(() => {
  clearAllData();
});
```

### バリデーション失敗時の「保存しない」テスト

バリデーション失敗時に `createRecord()` / `updateSettings()` を呼ばないのは**呼び出し側（UI層）の責務**であり、
サービス関数自体は入力をそのまま処理する。
そのため、テストでは「バリデーション結果が `valid: false` であれば保存処理を行わない」という呼び出し側ロジックを模倣して検証する。

```ts
// テスト例
const result = validateRecord({ date: '', total: 0, correct: 0 });
if (result.valid) createRecord(...); // valid: false なので呼ばれない
expect(getSortedRecords()).toHaveLength(0);
```

### `vi.setSystemTime()` の使用

`validateSettings()` の「今日以降」判定は実行日に依存するため、`vi.setSystemTime()` で日付を固定する。
テストの `afterEach` で `vi.useRealTimers()` を呼んでリセットする。

---

## 完了条件

- `npm test` で全テストケースがパスする
- 各サービスの連携フロー（追加・削除・設定保存）がカバーされている
- 各テストの `beforeEach` で LocalStorage がクリアされており、テスト間で状態が汚染されない

---

## 依存関係

- 依存するIssue: Issue-002（storage）、Issue-003（calculator）、Issue-004（validation）
- このIssueに依存するIssue: なし（Issue-019〜021 の UI 結合テストとは独立）
