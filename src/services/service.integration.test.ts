// src/services/service.integration.test.ts
// validation → calculator → storage の連携を検証する結合テスト。
//
// ユニットテスト（issue-015〜017）は各サービスの単体の正しさを保証するが、
// 「バリデーションを通過した入力が正しく保存されるか」
// 「削除後に前回比が再計算されるか」といったサービス間連携はここで初めて検証する。
//
// UI（React）に依存しない純粋な TS テストのため React Testing Library は不要。
// LocalStorage を使うため jsdom 環境が必要。

// @vitest-environment jsdom

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateRecord, validateSettings } from '../utils/validation';
import { calculateComparisons } from './calculator';
import {
  createRecord,
  getSortedRecords,
  deleteRecord,
  updateSettings,
  getSettings,
  getAverageRate,
  getTotalCount,
  clearAllData,
} from './storage';

// テスト間でデータが持ち越されるとテスト順序依存のバグが生まれるため、
// 各テスト前に LocalStorage をクリアする。
beforeEach(() => {
  clearAllData();
});

// ========== 1. validateRecord → createRecord パイプライン ==========

describe('validateRecord → createRecord パイプライン', () => {
  test('有効な入力を通すと rate が正しく計算されて保存される', () => {
    const input = { date: '2026-04-07', total: 50, correct: 42 };

    // UI 層が行う「バリデーション通過後に保存」フローを模倣する
    const validation = validateRecord(input);
    expect(validation.valid).toBe(true);

    const record = createRecord(input);

    expect(record).not.toBeNull();
    // calculateRate(42, 50) = 84.0 が storage 内部で計算されて保存されていること
    expect(record!.rate).toBe(84.0);
  });

  test('validateRecord がエラーを返した場合、createRecord を呼ばないと保存が防げる', () => {
    // total: 0 はバリデーションエラー
    const input = { date: '2026-04-07', total: 0, correct: 0 };

    const validation = validateRecord(input);
    expect(validation.valid).toBe(false);

    // 呼び出し側（UI層）が valid: false のとき createRecord を呼ばない責務を持つ。
    // テストではその呼び出し側ロジックを模倣して「呼ばない」ことを確認する。
    if (validation.valid) {
      createRecord(input);
    }

    // バリデーションを通過しなかったので保存されていないこと
    expect(getSortedRecords()).toHaveLength(0);
  });
});

// ========== 2. createRecord → getSortedRecords → calculateComparisons パイプライン ==========

describe('createRecord → getSortedRecords → calculateComparisons パイプライン', () => {
  test('複数件保存後に getSortedRecords が日付降順で返る', () => {
    // 挿入順は日付バラバラにして、ソートが正しく機能するかを確認する
    createRecord({ date: '2026-04-05', total: 50, correct: 38 }); // 最古
    createRecord({ date: '2026-04-07', total: 50, correct: 42 }); // 最新
    createRecord({ date: '2026-04-06', total: 80, correct: 68 }); // 中間

    const sorted = getSortedRecords();

    expect(sorted).toHaveLength(3);
    expect(sorted[0].date).toBe('2026-04-07');
    expect(sorted[1].date).toBe('2026-04-06');
    expect(sorted[2].date).toBe('2026-04-05');
  });

  test('同日複数件は createdAt 降順で返る', () => {
    // vi.setSystemTime で createdAt に差をつける
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T09:00:00.000Z'));
    createRecord({ date: '2026-04-07', total: 50, correct: 30 });

    vi.setSystemTime(new Date('2026-04-07T10:00:00.000Z'));
    const later = createRecord({ date: '2026-04-07', total: 50, correct: 42 });
    vi.useRealTimers();

    const sorted = getSortedRecords();
    // createdAt が新しい方（later）が先頭に来ること
    expect(sorted[0].id).toBe(later!.id);
  });

  test('getSortedRecords の結果を calculateComparisons に渡すと正しい前回比が得られる', () => {
    createRecord({ date: '2026-04-05', total: 50, correct: 38 }); // rate: 76.0
    createRecord({ date: '2026-04-06', total: 50, correct: 42 }); // rate: 84.0
    createRecord({ date: '2026-04-07', total: 80, correct: 68 }); // rate: 85.0

    const sorted = getSortedRecords();
    // sorted: [2026-04-07(85.0), 2026-04-06(84.0), 2026-04-05(76.0)]

    const comparisons = calculateComparisons(sorted);

    // 最新 85.0 - 84.0 = 1.0
    expect(comparisons[0]).toBe(1.0);
    // 中間 84.0 - 76.0 = 8.0
    expect(comparisons[1]).toBe(8.0);
    // 最古は前回なし
    expect(comparisons[2]).toBeNull();
  });

  test('中間レコードを deleteRecord 後に再計算すると、隣接レコード間の前回比が正しく更新される', () => {
    createRecord({ date: '2026-04-05', total: 50, correct: 38 }); // rate: 76.0
    const middle = createRecord({ date: '2026-04-06', total: 50, correct: 42 }); // rate: 84.0
    createRecord({ date: '2026-04-07', total: 80, correct: 68 }); // rate: 85.0

    // 中間レコード（2026-04-06, rate 84.0）を削除
    deleteRecord(middle!.id);

    const sorted = getSortedRecords();
    // sorted: [2026-04-07(85.0), 2026-04-05(76.0)]
    expect(sorted).toHaveLength(2);

    const comparisons = calculateComparisons(sorted);
    // 削除により直接隣接: 85.0 - 76.0 = 9.0
    expect(comparisons[0]).toBe(9.0);
    // 最古は前回なし
    expect(comparisons[1]).toBeNull();
  });
});

// ========== 3. validateSettings → updateSettings → getSettings パイプライン ==========

describe('validateSettings → updateSettings → getSettings パイプライン', () => {
  // validateSettings は new Date() で「今日」を取得するので日付を固定する
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-12T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('有効な将来日付を保存すると getSettings で同じ値が取得できる', () => {
    const settings = { examDate: '2026-05-25' };

    const validation = validateSettings(settings);
    expect(validation.valid).toBe(true);

    updateSettings(settings);

    expect(getSettings().examDate).toBe('2026-05-25');
  });

  test('null を updateSettings で保存すると getSettings で { examDate: null } が返る', () => {
    // まず有効な日付を保存してから null で上書きする
    updateSettings({ examDate: '2026-05-25' });
    updateSettings({ examDate: null });

    expect(getSettings()).toEqual({ examDate: null });
  });

  test('validateSettings がエラーを返した場合（過去日付）、updateSettings を呼ばないと保存が防げる', () => {
    const settings = { examDate: '2025-01-01' }; // 過去日付

    const validation = validateSettings(settings);
    expect(validation.valid).toBe(false);

    // 呼び出し側が valid: false のとき updateSettings を呼ばないことを模倣する
    if (validation.valid) {
      updateSettings(settings);
    }

    // 保存が行われていないので初期値のまま
    expect(getSettings()).toEqual({ examDate: null });
  });

  test('validateSettings がエラーを返した場合（不正形式）、updateSettings を呼ばないと保存が防げる', () => {
    const settings = { examDate: '2026/05/25' }; // スラッシュ区切りは不正形式

    const validation = validateSettings(settings);
    expect(validation.valid).toBe(false);

    if (validation.valid) {
      updateSettings(settings);
    }

    expect(getSettings()).toEqual({ examDate: null });
  });
});

// ========== 4. getAverageRate / getTotalCount の連携確認 ==========

describe('getAverageRate / getTotalCount の連携確認', () => {
  test('複数件保存後に getAverageRate が正しい平均正答率を返す', () => {
    createRecord({ date: '2026-04-05', total: 50, correct: 38 }); // rate: 76.0
    createRecord({ date: '2026-04-06', total: 50, correct: 42 }); // rate: 84.0
    createRecord({ date: '2026-04-07', total: 80, correct: 68 }); // rate: 85.0

    // (76.0 + 84.0 + 85.0) / 3 = 81.666... → 小数第1位: 81.7
    expect(getAverageRate()).toBe(81.7);
  });

  test('deleteRecord 後に getAverageRate と getTotalCount が削除後の件数で再計算される', () => {
    createRecord({ date: '2026-04-05', total: 50, correct: 38 }); // rate: 76.0
    const r2 = createRecord({ date: '2026-04-06', total: 50, correct: 42 }); // rate: 84.0
    createRecord({ date: '2026-04-07', total: 80, correct: 68 }); // rate: 85.0

    // 削除前の確認
    expect(getTotalCount()).toBe(3);

    deleteRecord(r2!.id);

    // 削除後: rate 76.0 と 85.0 の2件
    expect(getTotalCount()).toBe(2);
    // (76.0 + 85.0) / 2 = 80.5
    expect(getAverageRate()).toBe(80.5);
  });

  test('0件のとき getAverageRate は 0 を返す', () => {
    // ゼロ除算で NaN/Infinity になると LocalStorage のデータが壊れるため 0 を返す設計
    expect(getAverageRate()).toBe(0);
  });
});
