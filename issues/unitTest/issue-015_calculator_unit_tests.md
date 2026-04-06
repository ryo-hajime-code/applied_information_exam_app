# Issue-015: calculator.tsのユニットテスト実装

## 概要
`src/services/calculator.ts` の計算ロジックに対するユニットテストを Vitest で実装する。
計算ロジックは最も重要なビジネスロジックであり、回帰バグを防ぐために優先的にテストを追加する。

## タスク
- [ ] `src/services/calculator.test.ts` を作成する
- [ ] `calculateRate()` のテストケースを実装する
  - 正常ケース: `calculateRate(42, 50)` → `84.0`
  - 正常ケース: `calculateRate(68, 80)` → `85.0`
  - ゼロ除算: `calculateRate(0, 0)` → `0`
  - 0点: `calculateRate(0, 50)` → `0.0`
  - 満点: `calculateRate(50, 50)` → `100.0`
  - 小数点の丸め: 結果が小数点第1位まで、小数点第2位は四捨五入する
  - 正答率の四捨五入: `calculateRate(1, 3)` → `33.3`
- [ ] `calculateComparison()` のテストケースを実装する
  - 正の差分: `calculateComparison(85.0, 84.0)` → `1.0`
  - 負の差分: `calculateComparison(76.0, 84.0)` → `-8.0`
  - ゼロ: `calculateComparison(84.0, 84.0)` → `0.0`
- [ ] `calculateComparisons()` のテストケースを実装する
  - 設計書（05_api-design.md）セクション8.3のテストケースを実装
  - 最後の要素が `null` であることを確認
  - 空配列: `[]` → `[]`

## 完了条件
- `npm test` で全テストケースがパスする
- 境界値ケース（0点、満点、ゼロ除算、空配列）がカバーされている

## 依存関係
- 依存するIssue: Issue-003
- このIssueに依存するIssue: なし

## 備考
- テストは純粋関数のみ対象なのでモックは不要
- `describe` でテスト関数ごとにグループ化する