# Issue-006: Toastコンポーネントの実装

## 概要
`src/components/Toast.tsx` に、操作結果をユーザーに通知するトースト通知コンポーネントを実装する。
記録追加・削除後に画面下部からスライドインし、2秒後に自動消去する動作を実現する。

## タスク
- [ ] `src/components/Toast.tsx` を作成する
  - Props: `ToastProps`（`message`, `isVisible`, `type: 'success' | 'info'`）を使用
  - スタイル: 成功時(#34C759)、削除時(#8E8E93)
  - 表示位置: 画面下部
  - アニメーション: 画面下部からスライドイン（0.3秒）
  - 2秒で自動消去（`setTimeout` で `isVisible` を `false` に戻すコールバックを呼ぶ）
- [ ] CSSアニメーション（`@keyframes`）でスライドインを実装する
- [ ] `isVisible` が `false` の場合は非表示（CSSで制御）

## 完了条件
- `isVisible: true` の時に画面下部からスライドインして表示される
- `type` に応じて背景色が変わる（成功: 緑、情報: グレー）
- 2秒後に親コンポーネントへコールバックが呼ばれ消去できること

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-013, Issue-014

## 備考
- 実際の自動消去タイマーは親コンポーネント（Home, RecordList）側で管理してもよい
- スライドインアニメーションのdurationは0.3秒（設計書の仕様通り）