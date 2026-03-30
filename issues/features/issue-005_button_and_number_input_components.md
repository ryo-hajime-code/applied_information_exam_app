# Issue-005: Button・NumberInputコンポーネントの実装

## 概要
再利用可能な基本UIコンポーネントである `Button` と `NumberInput` を実装する。
画面設計書のスタイル定義に従い、プライマリ・セカンダリ・デンジャーの3種のボタンと、数値入力フィールドを構築する。

## タスク
- [ ] `src/components/Button.tsx` を作成する
  - Props: `label`, `variant`（`'primary' | 'secondary' | 'danger'`）, `onClick`, `disabled`
  - スタイル: プライマリ(#007AFF)、セカンダリ(#F2F2F7)、デンジャー(#FF3B30)
  - 共通スタイル: パディング上下16px・左右24px、角丸8px
  - タッチフィードバック: タップ時に背景色を暗く（0.2秒）
  - 最小タッチターゲット: 44px × 44px（アクセシビリティ対応）
- [ ] `src/components/NumberInput.tsx` を作成する
  - Props: `label`, `value`, `onChange`, `placeholder`, `error`, `min`, `max`
  - スタイル: 通常(#D1D1D6ボーダー)、フォーカス(#007AFTボーダー)、エラー(#FF3B30ボーダー + 赤枠)
  - エラーメッセージをフィールド直下にインライン表示（赤文字）
  - `<label>` を設定する（アクセシビリティ）
- [ ] styled-componentsでスタイルを実装する
- [ ] `npm run dev` でコンポーネントの表示確認

## 完了条件
- `Button` が variant に応じた色で表示される
- `NumberInput` がエラー時に赤枠・赤文字でエラーを表示する
- TypeScriptの型チェックが通る

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-011, Issue-013, Issue-014

## 備考
- 画面設計書（04_screen-design.md）セクション5のスタイル定義を参照すること
- ボタンのアクセシビリティ: `aria-label` は必要に応じて追加