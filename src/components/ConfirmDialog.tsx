// src/components/ConfirmDialog.tsx
// 削除操作前の確認ダイアログ。
import { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import type { ConfirmDialogProps } from '../types';

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

  // escキーでダイアログを閉じるため、ダイアログ表示時に div へフォーカスを移す。
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);


  // Esc キーでキャンセル
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  // isOpen: false の時（ダイアログを開いていない時）は null を返してレンダリングをスキップ
  if (!isOpen) return null;

  return (
    // 薄暗い背景をクリックしてもダイアログは閉じる
    <Overlay onClick={onCancel}>
      <Dialog
        ref={dialogRef}
        // tabIndex={-1} がないとdivタグはフォーカスを受け取れず、escキーでダイアログが閉じない。
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <Message id="confirm-dialog-message">{message}</Message>
        <ButtonRow>
          <Button label="キャンセル" variant="secondary" onClick={onCancel} />
          <Button label="削除" variant="danger" onClick={onConfirm} />
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
