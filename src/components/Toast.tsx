// src/components/Toast.tsx
// 操作結果を画面下部からスライドインで通知するトーストコンポーネント。
// 自動消去タイマーは親コンポーネント側で管理する設計にした理由:
// Toast 自身が setTimeout を持つと、isVisible が切り替わるたびにタイマーが
// 複数生成されてクリーンアップが複雑になるため。

import styled, { css, keyframes } from 'styled-components';
import type { ToastProps } from '../types';

export function Toast({ message, isVisible, type }: ToastProps) {
  return (
    <ToastContainer $isVisible={isVisible} $type={type} role="status" aria-live="polite">
      {message}
    </ToastContainer>
  );
}

// ─── Styled Components ───────────────────────────────────────────

// 画面下部から上方向にスライドインするアニメーション（04_screen-design.md セクション7）
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// type ごとの背景色（04_screen-design.md セクション5.5）
const typeStyles = {
  success: css`
    background-color: #34c759;
  `,
  info: css`
    background-color: #8e8e93;
  `,
};

const ToastContainer = styled.div<{ $isVisible: boolean; $type: ToastProps['type'] }>`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);

  padding: 12px 24px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;

  /* z-index を高くして他の要素の上に重ねる */
  z-index: 1000;

  ${({ $type }) => typeStyles[$type]}

  /* isVisible に応じて表示・非表示を切り替える。
   * display: none ではなく visibility + pointer-events を使う理由:
   * display 切替だとスライドインアニメーションが毎回リセットされずに済み、
   * 将来フェードアウトを追加する際も CSS で完結させやすいため。 */
  ${({ $isVisible }) =>
    $isVisible
      ? css`
          visibility: visible;
          animation: ${slideIn} 0.3s ease forwards;
        `
      : css`
          visibility: hidden;
          pointer-events: none;
        `}
`;
