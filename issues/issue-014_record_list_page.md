# Issue-014: RecordList画面の実装

## 概要
`src/pages/RecordList.tsx` に、演習記録の一覧表示・削除ができる画面を実装する。
サマリー情報（平均正答率・総演習回数）の表示と、記録削除フローのエンドツーエンド実装を完成させる。

## タスク
- [ ] `src/pages/RecordList.tsx` を実装する
  - ローカルstate: `records`, `comparisons`, `stats`, `deleteTargetId`, `isDialogOpen`, `toast`
  - `useEffect` でマウント時に `getSortedRecords()`, `calculateComparisons()`, `getAverageRate()`, `getTotalCount()` を呼んで初期化する
- [ ] ヘッダーを実装する（左: 「← 戻る」ボタン, 中央: 「記録一覧」）
- [ ] サマリー情報を実装する（「平均正答率: X%」「総演習回数: X回」）
- [ ] `RecordCard` を一覧表示する（`getSortedRecords()` の順序で表示、`onDelete` ハンドラを渡す）
- [ ] 記録0件時の空状態UIを実装する（「まだ記録がありません」「ホームに戻る」ボタン）
- [ ] 削除ハンドラ `handleDeleteClick(id)` を実装する（ConfirmDialogを開く）
- [ ] 削除確認ハンドラ `handleDeleteConfirm()` を実装する
  1. `deleteRecord(id)` で削除
  2. 一覧・統計を再取得・更新
  3. トースト通知「記録を削除しました」を表示（2秒で消去）
  4. ダイアログを閉じる
  5. 削除によって隣接レコードの前回比を再計算する
- [ ] `ConfirmDialog` コンポーネントを組み込む
- [ ] `Toast` コンポーネントを組み込む

## 完了条件
- 記録が一覧表示される（日付降順）
- サマリー情報（平均正答率・総演習回数）が正しく表示される
- 削除ボタンをタップするとConfirmDialogが開く
- 削除確認後に記録が削除され、一覧とサマリーが更新される
- 記録0件時に空状態UIが表示される

## 依存関係
- 依存するIssue: Issue-002, Issue-003, Issue-006, Issue-007, Issue-008, Issue-009
- このIssueに依存するIssue: なし

## 備考
- 設計書（05_api-design.md）セクション7.2、7.3の実装例を参照
- 削除後は `calculateComparisons()` を再実行して前回比を再計算すること（隣接レコードの前回比が変わる可能性あり）
- 「戻る」ボタンは `useNavigate(-1)` またはリンクで `/` に遷移する