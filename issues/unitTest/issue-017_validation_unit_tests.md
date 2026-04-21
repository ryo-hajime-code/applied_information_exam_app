# Issue-017: validation.tsのユニットテスト実装

## 概要
`src/utils/validation.ts` のバリデーション関数に対するユニットテストを Vitest で実装する。
設計書のバリデーションルールがすべてカバーされていることを検証する。

## タスク
- [ ] `src/utils/validation.test.ts` を作成する
- [ ] `validateRecord()` のテストケースを実装する
  - 正常ケース: 全フィールドが有効な値
  - エラーケース: `date` が空
  - エラーケース: `date` が不正形式（YYYY-MM-DD以外）
  - エラーケース: `total` が 0
  - エラーケース: `total` が 201（上限超過）
  - エラーケース: `correct` が -1
  - エラーケース: `correct` が `total` 超過
  - 境界値: `total === 1`, `total === 200`, `correct === 0`, `correct === total`
- [ ] `validateSettings()` のテストケースを実装する
  - 正常ケース: 有効な将来の日付
  - 正常ケース: `examDate` が `null`（未設定）
  - 正常ケース: `examDate` が `""`（空文字）→ `null` と同様に falsy 扱いで有効
  - エラーケース: 過去の日付
  - エラーケース: 不正形式の日付
  - 境界値: `examDate` が今日（当日） → 有効（`examDate < today` の境界。実装は `today.setHours(0,0,0,0)` で時刻を切り捨てて比較するため、当日は通過する）
  - 境界値: `examDate` が昨日 → 無効
  - 境界値: `examDate` が明日 → 有効

## 完了条件
- `npm test` で全テストケースがパスする
- `validateRecord()` と `validateSettings()` の全バリデーションルールがカバーされている
- `validateSettings()` の境界値（当日・昨日・明日）がカバーされている
- `validateSettings()` の空文字ケースがカバーされている

## 依存関係
- 依存するIssue: Issue-004
- このIssueに依存するIssue: なし

## 備考
- バリデーションルールの詳細は `03_database.md` セクション7を参照
- `validateSettings()` の「今日以降」の判定は、テスト実行日に依存する。`vi.setSystemTime()` で日付を固定してテストする
- 空文字 `""` は TypeScript 型上 `string | null` の `string` に該当するが、実装の `if (settings.examDate)` が falsy 評価するため `null` と同じ挙動になる。この挙動を明示的にテストで記録しておく