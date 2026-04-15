// src/pages/Home.integration.test.tsx
// Home 画面の結合テスト。
//
// ここでは「複数コンポーネントとサービス層が連携した結果」を検証する。
//
// ロジックの正確性（前回比の計算値など）は service.integration.test.ts でカバー済み。
// ここでは「UIが表示される／されない」という描画の有無のみを検証する。
//
// styled-components のクラス名は動的なため、
// getByRole / getByText / getByLabelText でクエリする。

import { describe, test, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clearAllData, createRecord, getSortedRecords } from '../services/storage';
import { renderWithRouter } from '../test/renderWithRouter';

// テスト間でデータが持ち越されるとテスト順序依存のバグが生まれるため、
// 各テスト前に LocalStorage をクリアする。
beforeEach(() => {
  clearAllData();
});

// ========== 1. Home 画面 — 記録追加フロー ==========

describe('Home 画面 — 記録追加フロー', () => {
  test('問題数・正答数を入力して「記録する」をクリックすると LocalStorage に記録が保存される', async () => {
    // userEvent.setup() で、ユーザーの操作（クリックや入力）を再現
    const user = userEvent.setup();
    // ホーム画面表示
    renderWithRouter(['/']);

    // NumberInput の label テキストで input を特定する。
    // styled.label が htmlFor と紐付いているため getByLabelText が使える。
    // await をつけることで、入力完了したら次の項目に行くようになる。
    await user.type(screen.getByLabelText('解いた問題数'), '80');
    await user.type(screen.getByLabelText('正答した問題数'), '60');
    await user.click(screen.getByRole('button', { name: '記録する' }));

    // LocalStorage に保存された記録を確認する。
    // 保存件数は1件か、totalには"80"が保存されるか、correctには"60"が保存されるかのチェック
    const saved = getSortedRecords();
    expect(saved).toHaveLength(1);
    expect(saved[0].total).toBe(80);
    expect(saved[0].correct).toBe(60);
  });

  test('記録保存後にトースト「記録を追加しました ✓」が表示される', async () => {
    const user = userEvent.setup();
    renderWithRouter(['/']);

    await user.type(screen.getByLabelText('解いた問題数'), '80');
    await user.type(screen.getByLabelText('正答した問題数'), '60');
    await user.click(screen.getByRole('button', { name: '記録する' }));

    // waitFor を使うことで、Reactの画面更新の完了を待てる。
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('記録を追加しました ✓');
    });
  });

  test('初回記録（前回なし）の場合、ComparisonDisplay（前回比）は表示されない', async () => {
    const user = userEvent.setup();
    renderWithRouter(['/']);

    await user.type(screen.getByLabelText('解いた問題数'), '80');
    await user.type(screen.getByLabelText('正答した問題数'), '60');
    await user.click(screen.getByRole('button', { name: '記録する' }));

    // 前回記録がないため comparison は null のまま → Home が ComparisonDisplay を描画しない。
    // queryByText は要素が存在しない場合 null を返すため、not.toBeVisible で確認する。
    expect(screen.queryByText(/前回比/)).not.toBeVisible();
  });

  test('記録が2件以上ある場合、記録追加後に ComparisonDisplay が表示される', async () => {
    // 事前に1件保存することで「前回記録あり」の状態にする。
    // 過去日付（2020-01-01）にすることで、今日の記録より古いことが確実になる。
    // 日付降順ソートで今日の記録が index 0、この記録が index 1（＝前回）になる。
    createRecord({ date: '2020-01-01', total: 80, correct: 56 }); // rate: 70.0

    const user = userEvent.setup();
    renderWithRouter(['/']);

    await user.type(screen.getByLabelText('解いた問題数'), '80');
    await user.type(screen.getByLabelText('正答した問題数'), '60');
    await user.click(screen.getByRole('button', { name: '記録する' }));

    // 前回比が存在するため ComparisonDisplay が描画される。
    // ComparisonDisplay 内のテキストに「前回比:」が含まれる。
    // React state 更新後の描画を確実に待つため waitFor を使う。
    await waitFor(() => {
      expect(screen.getByText(/前回比/)).toBeVisible();
    });
  });
});

// ========== 2. Home → RecordList 画面遷移 ==========

describe('Home → RecordList 画面遷移', () => {
  test('「記録を見る」ボタンをクリックすると /records へ遷移し RecordList 画面が描画される', async () => {
    // renderWithRouter が MemoryRouter + Routes を組み合わせるため、
    // ブラウザなしで navigate('/records') によるルーティングをシミュレートできる。
    const user = userEvent.setup();
    renderWithRouter(['/']);

    await user.click(screen.getByRole('button', { name: '記録を見る' }));

    // RecordList には styled h1「記録一覧」がある。
    // heading role で存在を確認することで、遷移後のページが正しく描画されたと判断できる。
    expect(screen.getByRole('heading', { name: '記録一覧' })).toBeVisible();
  });
});
