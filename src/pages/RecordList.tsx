// src/pages/RecordList.tsx
// 記録一覧画面。演習記録の閲覧・削除ができる。
// 削除後は getSortedRecords() / calculateComparisons() を再実行して
// 隣接レコードの前回比を更新する（削除によって隣接関係が変わるため）。

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RecordCard } from '../components/RecordCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { Button } from '../components/Button';
import { calculateComparisons } from '../services/calculator';
import {
  getSortedRecords,
  getAverageRate,
  getTotalCount,
  deleteRecord,
} from '../services/storage';
import type { PracticeRecord } from '../types';

export default function RecordList() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [comparisons, setComparisons] = useState<(number | null)[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  // 削除確認ダイアログの開閉と対象IDを管理する。
  // null の場合は「削除対象が選ばれていない（ダイアログ非表示）」を意味する。
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // マウント時に LocalStorage から一覧を読み込む。
  // useEffect の依存配列を [] にして初回のみ実行する。
  useEffect(() => {
    loadData();
  }, []);

  // 一覧・前回比・統計をまとめて再取得する。
  // 削除後にも呼び出すことで、隣接レコードの前回比変化を反映させる。
  const loadData = () => {
    const sorted = getSortedRecords();
    setRecords(sorted);
    setComparisons(calculateComparisons(sorted));
    setStats({ average: getAverageRate(), total: getTotalCount() });
  };

  // 削除ボタン押下: ConfirmDialog を開くだけで、実際の削除はユーザー確認後に行う。
  // 削除対象をセットして、確認ダイアログを開く。
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setIsDialogOpen(true);
  };

  // 削除確認後の処理。
  // 1. deleteRecord() で LocalStorage から削除
  // 2. 一覧・統計を再取得（隣接レコードの前回比を再計算するため loadData() を使う）
  // 3. トースト通知を2秒表示
  // 4. ダイアログを閉じる
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;

    const success = deleteRecord(deleteTargetId);
    if (success) {
      // 削除後の一覧を取得する
      loadData();
      showToast('記録を削除しました');
    }

    setIsDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleDeleteCancel = () => {
    setIsDialogOpen(false);
    setDeleteTargetId(null);
  };

  // トースト通知を表示し、2秒後に自動消去する。
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <PageWrapper>
      <Header>
        {/* useNavigate(-1) で前の画面に戻る。
            history がない場合でも "/" に戻れるようフォールバックを持つ。 */}
        <BackButton type="button" onClick={() => navigate(-1)}>
          ← 戻る
        </BackButton>
        <Title>記録一覧</Title>
        {/* ヘッダーを左右均等にするためのスペーサー */}
        <HeaderSpacer />
      </Header>

      {records.length === 0 ? (
        // 記録0件時は空状態UIを表示する。
        // 「まだ記録がありません」と「ホームに戻る」ボタンを提示することで、
        // ユーザーが次にすべき操作を迷わないようにする（04_screen-design.md セクション6）。
        <EmptyState>
          <EmptyMessage>まだ記録がありません</EmptyMessage>
          <Button label="ホームに戻る" variant="primary" onClick={() => navigate('/')} />
        </EmptyState>
      ) : (
        <>
          <Summary>
            <SummaryText>平均正答率: {stats.average}%</SummaryText>
            <SummaryText>総演習回数: {stats.total}回</SummaryText>
          </Summary>

          <RecordListContainer>
            {records.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                comparison={comparisons[index] ?? null}
                onDelete={handleDeleteClick}
              />
            ))}
          </RecordListContainer>
        </>
      )}

      <ConfirmDialog
        isOpen={isDialogOpen}
        message={`この記録を削除しますか？\nこの操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <Toast message={toastMessage} isVisible={toastVisible} type="info" />
    </PageWrapper>
  );
}

// ─── Styled Components ───────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: 100dvh;
  background-color: var(--color-background);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

// 最小タッチターゲット 44px × 44px（WCAG 2.5.5 準拠）
const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #007aff;
  padding: 8px;
  min-height: 44px;
  min-width: 44px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:active {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0;
`;

// Header の左右バランスを取るためのダミー要素。
// BackButton と同じ幅を確保することで Title が中央に見える。
const HeaderSpacer = styled.div`
  min-width: 44px;
`;

const Summary = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
`;

const SummaryText = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
`;

const RecordListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex: 1;
  padding: 48px 0;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  color: #8e8e93;
  margin: 0;
`;
