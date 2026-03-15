// src/components/Button.tsx
// ページに依存しない汎用ボタン。variant でスタイルを切り替えることで、
// 用途ごとにコンポーネントを作らずに済む。
// styled-components を選んだ理由: variant に応じたスタイルの分岐を
// props で型安全に記述でき、CSS Modules のようにクラス名の文字列管理が不要になるため。

import styled, { css } from 'styled-components';

interface ButtonProps {
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, variant, onClick, disabled = false }: ButtonProps) {
  return (
    <StyledButton
      // $variant とプレフィックスを付けることで styled-components が DOM に
      // 不明な属性として渡すのを防ぐ（transient props）
      $variant={variant}
      onClick={onClick}
      disabled={disabled}
      // テキストが visible なため aria-label は不要。
      // スクリーンリーダーはボタンのテキストコンテンツを直接読み上げるため。
      type="button"
    >
      {label}
    </StyledButton>
  );
}

// ─── Styled Components ───────────────────────────────────────────

// variant ごとの背景色・文字色マップ（04_screen-design.md セクション5.1）
const variantStyles = {
  primary: css`
    background-color: #007aff;
    color: #ffffff;
  `,
  secondary: css`
    background-color: #f2f2f7;
    color: #000000;
  `,
  danger: css`
    background-color: #ff3b30;
    color: #ffffff;
  `,
};

const StyledButton = styled.button<{ $variant: ButtonProps['variant'] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 04_screen-design.md セクション5.1: 共通パディング */
  padding: 16px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;

  font-size: 16px;
  font-weight: 600;
  line-height: 1;

  /* 最小タッチターゲット: 44px × 44px（WCAG 2.5.5 / Apple HIG 準拠）*/
  min-height: 44px;
  min-width: 44px;

  /* ボタンタップ時の背景色変化アニメーション: 0.2秒（04_screen-design.md セクション7）*/
  transition: filter 0.2s ease, opacity 0.2s ease;

  ${({ $variant }) => variantStyles[$variant]}

  &:active {
    /* タップ時に背景色を暗くするためにフィルタを使用 */
    filter: brightness(0.85);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
