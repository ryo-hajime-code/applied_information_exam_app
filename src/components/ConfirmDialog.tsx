// src/components/ConfirmDialog.tsx
// 削除操作前の確認ダイアログ。
// isOpen: false の時は null を返してレンダリングをスキップ

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import type { ConfirmDialogProps } from '../types';

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
  // ダイアログが開いた時に「削除」ボタンにフォーカスを移動する。
  // useRef は DOM にアクセスするときにも使用する。
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Esc キーでキャンセル（04_screen-design.md セクション4.2.D）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    // 薄暗い背景をクリックしてもダイアログは閉じる
    <Overlay onClick={onCancel}>
      <Dialog
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <Message id="confirm-dialog-message">{message}</Message>
        <ButtonRow>
          <Button label="キャンセル" variant="secondary" onClick={onCancel} />
          {/* ref を渡すために Button コンポーネントを直接使わず、
              forwardRef が必要になるため独自のボタンを使用する */}
          <DangerButton
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
          >
            削除
          </DangerButton>
        </ButtonRow>
      </Dialog>
    </Overlay>
  );
}

// ─── Styled Components ───────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Toast (z-index: 1000) より下、通常コンテンツより上に表示 */
  z-index: 900;
`;

const Dialog = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: min(90vw, 360px);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #000000;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// Button コンポーネントへの ref 転送が必要なため、削除ボタンのみ直接スタイル定義する。
// Button コンポーネントに forwardRef を追加するよりも、
// ここだけ個別定義する方が変更範囲を最小に抑えられるため。
const DangerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  min-height: 44px;
  min-width: 44px;
  background-color: #ff3b30;
  color: #ffffff;
  transition: filter 0.2s ease;

  &:active {
    filter: brightness(0.85);
  }
`;
