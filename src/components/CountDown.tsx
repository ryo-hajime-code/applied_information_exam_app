// src/components/CountDown.tsx
// 受験日カウントダウンと受験日設定UIを一体化したコンポーネント。
// 設定ページ（/settings）を別途作らずにインライン展開する設計にした理由は、
// 画面遷移を減らしてユーザーの操作コストを下げるため（04_screen-design.md §3.2.A）。

import { useState } from 'react';
import styled from 'styled-components';
import { updateSettings } from '../services/storage';
import type { CountDownProps } from '../types';
import { calcDaysUntil } from '../utils/dateFormat';
import { validateSettings } from '../utils/validation';
import { Button } from './Button';

export function CountDown({ examDate, onExamDateChange }: CountDownProps) {
  // 編集UIの開閉状態。受験日設定済み・未設定どちらの表示からでも開ける。
  const [isEditing, setIsEditing] = useState(false);
  // 編集中の一時的な日付値。保存前にバリデーションで弾けるよう、確定前は state に保持する。
  const [draftDate, setDraftDate] = useState(examDate ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = () => {
    // 空文字は「受験日なし（null）」として保存する。
    // 設定削除の手段をユーザーに提供するため null を許容している。
    const settingsToValidate = { examDate: draftDate || null };
    const result = validateSettings(settingsToValidate);

    if (!result.valid) {
      setErrorMessage(result.error ?? 'エラーが発生しました');
      return;
    }

    const newDate = draftDate || null;
    updateSettings({ examDate: newDate });
    onExamDateChange(newDate);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleCancel = () => {
    // キャンセル時は下書きを元の値に戻してUIを閉じる
    setDraftDate(examDate ?? '');
    setErrorMessage(null);
    setIsEditing(false);
  };

  // 編集UI（インライン展開）
  if (isEditing) {
    return (
      <Container>
        <Label>受験予定日</Label>
        <DateInput
          type="date"
          value={draftDate}
          onChange={(e) => {
            setDraftDate(e.target.value);
            // 入力変更時にエラーをクリアしてリアルタイムバリデーション感を出す
            setErrorMessage(null);
          }}
          $hasError={errorMessage !== null}
        />
        {errorMessage && (
          <ErrorText role="alert" aria-live="polite">
            {errorMessage}
          </ErrorText>
        )}
        <ButtonRow>
          <Button label="保存" variant="primary" onClick={handleSave} />
          <Button label="キャンセル" variant="secondary" onClick={handleCancel} />
        </ButtonRow>
      </Container>
    );
  }

  // 受験日未設定の表示
  if (!examDate) {
    return (
      <Container
        role="button"
        tabIndex={0}
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
        aria-label="受験日を設定する"
      >
        <UnsettedText>受験日を設定する →</UnsettedText>
      </Container>
    );
  }

  // 受験日設定済みの表示（カウントダウン）
  const daysLeft = calcDaysUntil(examDate);

  const renderDaysText = () => {
    // 0日 = 当日、負数 = 試験日超過（過去）として表示する。
    // 超過後も表示を壊さないためにケースを分けている。
    if (daysLeft > 0) return `試験まであと ${daysLeft}日`;
    if (daysLeft === 0) return '今日が試験日です！';
    return `試験日を ${Math.abs(daysLeft)}日 過ぎました`;
  };

  return (
    <Container>
      <CountDownRow>
        <CountDownText>{renderDaysText()}</CountDownText>
        <EditButton
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="受験日を編集する"
        >
          ✏️
        </EditButton>
      </CountDownRow>
    </Container>
  );
}

// ─── Styled Components ───────────────────────────────────────────

const Container = styled.div`
  padding: 16px;
  background-color: var(--color-white);
  border-radius: 12px;
  /* カード影（04_screen-design.md §5.3）*/
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  cursor: default;
`;

const Label = styled.p`
  font-size: 14px;
  color: var(--color-neutral);
  margin-bottom: 8px;
`;

const DateInput = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ $hasError }) =>
    $hasError ? 'var(--color-border-error)' : 'var(--color-border)'};
  font-size: 16px;
  background-color: var(--color-white);
  margin-bottom: 4px;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
      $hasError ? 'var(--color-border-error)' : 'var(--color-border-focus)'};
  }
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: var(--color-danger);
  margin-bottom: 8px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const UnsettedText = styled.p`
  font-size: 16px;
  color: var(--color-primary);
  cursor: pointer;
`;

const CountDownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CountDownText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  /* タッチターゲット確保（WCAG 2.5.5）*/
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:active {
    background-color: var(--color-background);
  }
`;
