# Issue-007: ConfirmDialogコンポーネントの実装

## 概要
`src/components/ConfirmDialog.tsx` に、削除操作前に確認を求めるモーダルダイアログを実装する。
誤削除を防ぐため、削除対象の記録内容を表示しつつ「キャンセル」「削除」の選択を促す。

## タスク
- [ ] `src/components/ConfirmDialog.tsx` を作成する
  - Props: `ConfirmDialogProps`（`isOpen`, `message`, `onConfirm`, `onCancel`）を使用
  - `isOpen: false` の場合はレンダリングしないか非表示にする
  - 削除ボタンは赤色(#FF3B30)
  - キャンセルボタンはセカンダリスタイル
  - モーダルオーバーレイ（背景を暗くする）を実装する
- [ ] アクセシビリティ対応を実装する
  - `role="alertdialog"` を設定する
  - `aria-modal="true"` を設定する
  - ダイアログが開いた時にフォーカスを「削除」ボタンまたはダイアログ内に移動する
- [ ] Escキーでキャンセルできるよう `onKeyDown` を設定する

## 完了条件
- `isOpen: true` の時にモーダルが表示される
- 「削除」ボタンが赤色で表示される
- `onConfirm` / `onCancel` が正しく呼び出される
- `role="alertdialog"` が設定されている

## 依存関係
- 依存するIssue: Issue-001, Issue-005
- このIssueに依存するIssue: Issue-014

## 備考
- 画面設計書（04_screen-design.md）セクション4.2.D の削除確認ダイアログのレイアウトを参照
- `message` には削除対象の日付・問題数・正答率を含む文字列を渡す（親コンポーネントで整形）