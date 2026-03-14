# Issue-012: ComparisonDisplayコンポーネントの実装

## 概要
`src/components/ComparisonDisplay.tsx` に、記録追加後に表示する「前回比」コンポーネントを実装する。
正負ゼロに応じて色・アイコンを変えてフェードインで表示する。

## タスク
- [ ] `src/components/ComparisonDisplay.tsx` を作成する
  - Props: `ComparisonDisplayProps`（`comparison: number`）を使用
- [ ] 正の場合: 「前回比: +X.X% ⬆」を緑色(#34C759)で表示する
- [ ] 負の場合: 「前回比: -X.X% ⬇」を赤色(#FF3B30)で表示する
- [ ] ゼロの場合: 「前回比: ±0.0% →」をグレー(#8E8E93)で表示する
- [ ] `getComparisonStatus()` を使って状態を判定する
- [ ] フェードインアニメーション（0.3秒）を実装する

## 完了条件
- 数値に応じて正しい色・アイコンが表示される
- フェードインで表示される（0.3秒）
- TypeScriptの型チェックが通る

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-013

## 備考
- 色だけでなくアイコン(⬆⬇→)も必ず表示すること（色覚対応）
- このコンポーネントは値が存在する場合のみ表示する（nullチェックは親コンポーネントが担当）