// src/pages/Home.tsx
// ホーム画面。カウントダウン・記録入力・前回比表示・記録一覧への遷移を統合する。
// 各 UI パーツはコンポーネントに分割し、このページは「組み合わせと状態管理」に専念する。

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ComparisonDisplay } from '../components/ComparisonDisplay';
import { CountDown } from '../components/CountDown';
import { RecordForm } from '../components/RecordForm';
import { Toast } from '../components/Toast';
import { Button } from '../components/Button';
import { calculateComparison } from '../services/calculator';
import { getSortedRecords, getSettings } from '../services/storage';
import type { PracticeRecord } from '../types';

export default function Home() {
  const navigate = useNavigate();

  const [examDate, setExamDate] = useState<string | null>(null);
  const [comparison, setComparison] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // マウント時に LocalStorage から設定を読み込む。
  // useEffect の依存配列を [] にして初回のみ実行する。
  useEffect(() => {
    setExamDate(getSettings().examDate);
  }, []);

  // 「記録するボタン」のonClick で発火し、RecordForm.tsx から渡された入力情報を最新記録として保存する。
  // 同時に、前回比を計算して画面に表示する（Toast で表示）
  const handleSubmit = (newRecord: PracticeRecord) => {

    // RecordForm が createRecord() を呼んで保存済みの PracticeRecord を渡してくる。
    // ソート済み配列で最新記録の位置を特定し、その次（index + 1）を「前回」とする。この2つで前回比を計算する。
    // 保存済みの全レコードをソートして取得
    const sorted = getSortedRecords();
    // findIndex は配列内の要素を検索するためのメソッド
    const newIndex = sorted.findIndex((r) => r.id === newRecord.id);

    // 日付降順ソートで newRecord の次（index + 1）が時系列上の「前回」
    const previousRecord = newIndex < sorted.length - 1 ? sorted[newIndex + 1] : null;

    const newComparison = previousRecord
      ? calculateComparison(newRecord.rate, previousRecord.rate)
      : null;

    setComparison(newComparison);
    showToast('記録を追加しました ✓');
  };

  // 前回比を表示し、2秒後に自動消去する。
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <PageWrapper>
      <CountDown
        examDate={examDate}
        onExamDateChange={(date) => setExamDate(date)}
      />

      <RecordForm onSubmit={handleSubmit} />

      {/* 前回比は記録追加後にのみ表示。*/}
      {comparison !== null && (
        <ComparisonDisplay comparison={comparison} />
      )}

      <Button
        label="記録を見る"
        variant="secondary"
        onClick={() => navigate('/records')}
      />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        type="success"
      />
    </PageWrapper>
  );
}

// ─── Styled Components ───────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  /* min-height で画面全体を覆い、背景色が途切れないようにする */
  min-height: 100dvh;
  background-color: var(--color-background);
`;
