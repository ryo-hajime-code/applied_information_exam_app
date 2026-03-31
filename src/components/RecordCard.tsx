// src/components/RecordCard.tsx
// 1件の演習記録を表示するカード。削除確認ダイアログの表示は親（RecordList）が担当し、
// このコンポーネントは onDelete(id) を呼ぶだけに責務を絞る。

import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { getComparisonStatus } from '../types';
import { formatDate } from '../utils/dateFormat';
import type { RecordCardProps, ComparisonStatus } from '../types';

// RecordCardPropsインターフェース内のrecordはPracticeRecord型であり、
// PracticeRecordにidやdateなどの情報が含まれる。
export function RecordCard({ record, comparison, onDelete }: RecordCardProps) {
  // 削除ボタン押下後にフェードアウトアニメーションを再生してから onDelete を呼ぶ。
  // アニメーション終了を待つために isDeleting フラグを使う。
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleting(true);
    // 0.3秒のフェードアウト完了後に、onDelete(record.id)で親へ通知
    setTimeout(() => onDelete(record.id), 300);
  };

  // comparison（前回比の数値）を、色付け用の文字列に変換する(130~134行)
  const comparisonStatus = comparison !== null ? getComparisonStatus(comparison) : null;

  return (
    <Card $isDeleting={isDeleting}>
      <CardHeader>
        <DateText>{formatDate(record.date)}</DateText>
        <DeleteButton
          type="button"
          onClick={handleDeleteClick}
          aria-label={`${formatDate(record.date)}の記録を削除`}
        >
          🗑
        </DeleteButton>
      </CardHeader>

      <CardBody>
        <BodyText>{record.total}問中 {record.correct}問正解</BodyText>
        <BodyText>正答率: {record.rate}%</BodyText>
        <ComparisonText $status={comparisonStatus}>
          前回比: {formatComparison(comparison)}
        </ComparisonText>
      </CardBody>
    </Card>
  );
}

// 前回比の表示文字列を生成する。
// null（最古の記録）は「--」、正負ゼロは符号付き数値 + 矢印アイコンで表示。
// 色だけでなく矢印を付ける理由: 色覚多様性に対応するため（04_screen-design.md セクション8.2）。
function formatComparison(comparison: number | null): string {
  if (comparison === null) return '--';
  const status = getComparisonStatus(comparison);
  const sign = comparison > 0 ? '+' : '';
  const arrow = status === 'improved' ? '⬆' : status === 'declined' ? '⬇' : '→';
  return `${sign}${comparison}% ${arrow}`;
}

// ─── Styled Components ───────────────────────────────────────────

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

// 04_screen-design.md セクション5.3: カードスタイル
const Card = styled.div<{ $isDeleting: boolean }>`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);

  ${({ $isDeleting }) =>
    $isDeleting &&
    css`
      animation: ${fadeOut} 0.3s ease forwards;
    `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const DateText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #000000;
`;

// 最小タッチターゲット 44px × 44px（WCAG 2.5.5 準拠）
const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:active {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BodyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #000000;
`;

// ComparisonStatus ごとの文字色（04_screen-design.md セクション5.4）
const comparisonColors: Record<ComparisonStatus, string> = {
  improved:  '#34c759',
  declined:  '#ff3b30',
  unchanged: '#8e8e93',
};

const ComparisonText = styled.p<{ $status: ComparisonStatus | null }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $status }) => ($status ? comparisonColors[$status] : '#8e8e93')};
`;
