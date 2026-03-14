# Issue-003: 計算サービスの実装（calculator.ts）

## 概要
`src/services/calculator.ts` に、正答率・前回比の計算ロジックを純粋関数として実装する。
UIから分離することで、テストしやすく再利用性の高い計算層を構築する。

## タスク
- [ ] `src/services/calculator.ts` を作成する
- [ ] `calculateRate(correct, total)` を実装する（正答率を小数点第1位まで計算）
- [ ] `calculateComparison(currentRate, previousRate)` を実装する（前回比を小数点第1位まで計算）
- [ ] `calculateComparisons(sortedRecords)` を実装する（ソート済み全レコードの前回比を一括計算、最古のレコードは `null`）

## 完了条件
- `src/services/calculator.ts` が存在し、3つの関数がすべて実装されている
- `calculateRate(42, 50)` の結果が `84.0` であること
- `calculateComparisons()` の最後の要素が `null` であること
- 純粋関数として実装されており、副作用がない

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-002, Issue-013, Issue-014, Issue-015

## 備考
- `calculateRate()` の計算式: `Math.round((correct / total) * 1000) / 10`
- `total === 0` の場合は `0` を返す（ゼロ除算対策）
- `calculateComparisons()` はソート済み配列を前提とする（ソートはstorageサービスで行う）