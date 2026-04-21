// src/components/RecordForm.tsx
// 演習記録の入力フォーム。バリデーション・正答率計算をこのコンポーネント内に閉じ込め、
// 親（Home）はonSubmitで完成した PracticeRecord を受け取るだけにする。
// 責務を分離することで、Home が入力詳細を知らずに済む。

import { useState } from 'react';
import styled from 'styled-components';
import { createRecord } from '../services/storage';
import { calculateRate } from '../services/calculator';
import type { RecordFormProps } from '../types';
import { getTodayString } from '../utils/dateFormat';
import { validateRecord } from '../utils/validation';
import { Button } from './Button';
import { NumberInput } from './NumberInput';

export function RecordForm({ onSubmit }: RecordFormProps) {
  const [date, setDate] = useState(getTodayString());
  const [total, setTotal] = useState<number | ''>('');
  const [correct, setCorrect] = useState<number | ''>('');

  // フィールドごとのエラーを個別に管理することで、
  // どのフィールドが問題かを正確にハイライトできる
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [totalError, setTotalError] = useState<string | undefined>(undefined);
  const [correctError, setCorrectError] = useState<string | undefined>(undefined);

  // リアルタイム正答率: 両方未入力・未完成の場合は null を返す。
  // null のときに「---%」を表示することで、無効な中間状態をユーザーに見せない。
  const liveRate: number | null =
    total !== '' && correct !== ''
      ? calculateRate(correct as number, total as number)
      : null;

  // validateRecord を用いてフォーム送信前の一括バリデーションを行う。
  // 各フィールドのエラーをステートに反映し、送信は行わない。
  const handleSubmit = () => {
    // 未入力の数値フィールドは 0 として validateRecord に渡す。
    // validateRecord 側で 1 未満を弾くルールがあるため、空欄は自動的にエラーになる。
    const input = {
      date,
      total: total === '' ? 0 : total,
      correct: correct === '' ? 0 : correct,
    };

    const result = validateRecord(input);

    if (!result.valid) {
      // validateRecord は最初に発見したエラーのみ返す。
      // どのフィールドのエラーかをエラーメッセージで判定して振り分ける。
      const msg = result.error ?? '';
      if (msg.includes('実施日')) {
        setDateError(msg);
        setTotalError(undefined);
        setCorrectError(undefined);
      } else if (msg.includes('解いた問題数')) {
        setDateError(undefined);
        setTotalError(msg);
        setCorrectError(undefined);
      } else {
        setDateError(undefined);
        setTotalError(undefined);
        setCorrectError(msg);
      }
      return;
    }

    // バリデーション通過後に記録を保存する。
    // createRecord の前に getLatestRecord() を呼ぶ必要がある場合は親（Home）が担う。
    // RecordForm の責務は「有効な入力を onSubmit に渡すこと」のみ。
    const newRecord = createRecord(input as { date: string; total: number; correct: number });
    if (!newRecord) {
      // LocalStorage の容量超過など、保存自体に失敗したケース
      setCorrectError('記録の保存に失敗しました。再度お試しください。');
      return;
    }

    onSubmit(newRecord);

    // 送信成功後: 日付は今日のまま、数値フィールドのみリセット（04_screen-design.md §3.3）
    setTotal('');
    setCorrect('');
    setDateError(undefined);
    setTotalError(undefined);
    setCorrectError(undefined);
  };

  return (
    <FormWrapper>
      <SectionTitle>今日の記録を入力</SectionTitle>

      {/* 実施日フィールド */}
      <FieldGroup>
        <FieldLabel htmlFor="record-date">実施日</FieldLabel>
        <DateInput
          id="record-date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setDateError(undefined);
          }}
          $hasError={!!dateError}
          aria-invalid={!!dateError}
          aria-describedby="record-date-error"
        />
        <ErrorMessage id="record-date-error" aria-live="polite">
          {dateError ?? ''}
        </ErrorMessage>
      </FieldGroup>

      {/* 解いた問題数 */}
      <NumberInput
        label="解いた問題数"
        value={total}
        onChange={(v) => {
          setTotal(v);
          setTotalError(undefined);
        }}
        placeholder="例: 80"
        min={1}
        max={200}
        error={totalError}
      />

      {/* 正答した問題数 */}
      <NumberInput
        label="正答した問題数"
        value={correct}
        onChange={(v) => {
          setCorrect(v);
          setCorrectError(undefined);
        }}
        placeholder="例: 60"
        min={0}
        error={correctError}
      />

      {/* リアルタイム正答率表示
       * null のうちは「---%」を表示し、有効な入力が揃った時点で数値に切り替える */}
      <RateDisplay>
        正答率: <RateValue>{liveRate !== null ? `${liveRate}%` : '---%'}</RateValue>
      </RateDisplay>

      <Button label="記録する" variant="primary" onClick={handleSubmit} />
    </FormWrapper>
  );
}

// ─── Styled Components ───────────────────────────────────────────

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
`;

const DateInput = styled.input<{ $hasError: boolean }>`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ $hasError }) =>
    $hasError ? 'var(--color-border-error)' : 'var(--color-border)'};
  background-color: var(--color-white);
  font-size: 16px;
  color: var(--color-text);
  width: 100%;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${({ $hasError }) =>
      $hasError ? 'var(--color-border-error)' : 'var(--color-border-focus)'};
  }
`;

const ErrorMessage = styled.span`
  font-size: 13px;
  color: var(--color-danger);
  min-height: 1em;
`;

const RateDisplay = styled.p`
  font-size: 15px;
  color: var(--color-neutral);
`;

const RateValue = styled.span`
  font-weight: 600;
  color: var(--color-text);
`;
