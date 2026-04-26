// src/components/Button.tsx
// variant でスタイルを切り替えることで、用途ごとにコンポーネントを作らずに済む。

import styled, { css } from 'styled-components';

interface ButtonProps {
  // ボタンの文字
  label: string;
  // スタイル
  variant: 'primary' | 'secondary' | 'danger';
  // クリック時に呼び出す
  onClick: () => void;
  // クリックできるか否か
  disabled?: boolean;
}

export function Button({ label, variant, onClick, disabled = false }: ButtonProps) {
  return (
    <StyledButton
      $variant={variant}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </StyledButton>
  );
}

// ─── Styled Components ───────────────────────────────────────────

// variant ごとの背景色・文字色マップ
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
