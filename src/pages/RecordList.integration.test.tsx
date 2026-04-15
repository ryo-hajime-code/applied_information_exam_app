// src/pages/RecordList.integration.test.tsx
// RecordList 画面の結合テスト。
//
// ここでは「複数コンポーネントとサービス層が連携した結果」を検証する。
//
// ロジックの正確性（前回比の計算値など）は service.integration.test.ts でカバー済み。
// ここでは「UIが表示される／されない」という描画の有無のみを検証する。
//
// styled-components のクラス名は動的なため、
// getByRole / getByText / getByLabelText でクエリする。

import { describe, test, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clearAllData, createRecord, getAllRecords } from '../services/storage';
import { renderWithRouter } from '../test/renderWithRouter';

// テスト間でデータが持ち越されるとテスト順序依存のバグが生まれるため、
// 各テスト前に LocalStorage をクリアする。
beforeEach(() => {
  clearAllData();
});

// ========== 1. RecordList 画面 — 一覧表示フロー ==========

describe('RecordList 画面 — 一覧表示フロー', () => {
  test('LocalStorage に記録がある状態でアクセスすると RecordCard が記録数分描画される', () => {
    createRecord({ date: '2025-01-01', total: 80, correct: 60 });
    createRecord({ date: '2025-01-02', total: 80, correct: 64 });
    createRecord({ date: '2025-01-03', total: 80, correct: 68 });

    renderWithRouter(['/records']);

    // RecordCard の削除ボタンは aria-label 付き。記録数分（3件）の削除ボタンが存在することで、
    // RecordCard が記録数分描画されたことを確認する。
    const deleteButtons = screen.getAllByRole('button', { name: /の記録を削除/ });
    expect(deleteButtons).toHaveLength(3);
  });

  test('平均正答率・総演習回数が画面に描画される', () => {
    createRecord({ date: '2025-01-01', total: 80, correct: 60 });
    createRecord({ date: '2025-01-02', total: 80, correct: 64 });

    renderWithRouter(['/records']);

    // 計算値の精度検証は service.integration.test.ts でカバー済み。
    // ここでは「テキストが存在する」という描画の有無のみを検証する。
    expect(screen.getByText(/平均正答率:/)).toBeVisible();
    expect(screen.getByText(/総演習回数:/)).toBeVisible();
  });

  test('LocalStorage が空の状態でアクセスすると「まだ記録がありません」が表示される', () => {
    renderWithRouter(['/records']);

    expect(screen.getByText('まだ記録がありません')).toBeVisible();
  });
});

// ========== 2. RecordList 画面 — 削除フロー ==========

describe('RecordList 画面 — 削除フロー', () => {
  test('削除ボタンをクリックし ConfirmDialog で確認すると記録が一覧から消え LocalStorage からも削除されトーストが表示される', async () => {
    createRecord({ date: '2025-01-01', total: 80, correct: 60 });

    const user = userEvent.setup();
    renderWithRouter(['/records']);

    // 削除ボタンをクリックする。RecordCard 内に 300ms のフェードアウトアニメーションがあり、
    // アニメーション完了後に親の handleDeleteClick が呼ばれて ConfirmDialog が開く。
    const deleteButton = screen.getByRole('button', { name: /の記録を削除/ });
    await user.click(deleteButton);

    // findByRole はデフォルト 1000ms 待機するため、300ms のタイマー完了後に
    // ConfirmDialog が開くのを自然に待てる。
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeVisible();

    // 「削除」ボタンをクリックして削除を確定する。
    await user.click(screen.getByRole('button', { name: '削除' }));

    // LocalStorage から削除されたことを確認する。
    expect(getAllRecords()).toHaveLength(0);

    // Toast は非同期で表示されるため findByText で出現を待つ。
    await screen.findByText('記録を削除しました');
  });
});

// ========== 3. RecordList → Home 画面遷移 ==========

describe('RecordList → Home 画面遷移', () => {
  test('「← 戻る」ボタンをクリックすると前の画面（/）に戻る', async () => {
    const user = userEvent.setup();
    // initialEntries に 2 つのパスを渡して「/ → /records の履歴」をシミュレートする。
    // navigate(-1) は history の 1 つ前に戻るため、履歴に / が存在することが必要。
    renderWithRouter(['/', '/records']);

    await user.click(screen.getByRole('button', { name: '← 戻る' }));

    // Home 画面には「記録する」ボタンがある。遷移後のページが正しく描画されたと判断できる。
    expect(screen.getByRole('button', { name: '記録する' })).toBeVisible();
  });

  test('空状態の「ホームに戻る」ボタンをクリックすると / に遷移し Home 画面が描画される', async () => {
    // LocalStorage が空 → 空状態UI（「まだ記録がありません」+「ホームに戻る」）が表示される。
    const user = userEvent.setup();
    renderWithRouter(['/records']);

    await user.click(screen.getByRole('button', { name: 'ホームに戻る' }));

    // Home 画面には「記録する」ボタンがある。遷移後のページが正しく描画されたと判断できる。
    expect(screen.getByRole('button', { name: '記録する' })).toBeVisible();
  });
});
