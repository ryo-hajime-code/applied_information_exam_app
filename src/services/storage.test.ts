// src/services/storage.test.ts
// storage.ts の LocalStorage 操作関数のユニットテスト。
//
// jsdom 環境を使う理由: LocalStorage は Web API のため Node.js 環境では利用できない。
// @vitest-environment アノテーションでファイル単位に jsdom を適用し、
// calculator.test.ts（純粋関数のみ）には jsdom オーバーヘッドを与えない。

// @vitest-environment jsdom

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  createRecord,
  getAllRecords,
  getLatestRecord,
  deleteRecord,
  getSortedRecords,
  clearAllData,
} from './storage';

// 各テスト前に LocalStorage をリセットする。
// テスト間でデータが持ち越されるとテスト順序依存のバグが生まれるため、
// clearAllData() で必ずクリーンな状態から始める。
beforeEach(() => {
  clearAllData();
});

// ========== createRecord() ==========

describe('createRecord', () => {
  test('正常に記録を作成できる（設計書 8.1）', () => {
    const record = createRecord({
      date: '2026-02-15',
      total: 50,
      correct: 42,
    });

    expect(record).not.toBeNull();
    // 正答率が正しく計算されていること
    expect(record!.rate).toBe(84.0);
    // ID が UUID v4 形式であること（crypto.randomUUID() を使うため）
    // Date.now() では高速連続操作で衝突リスクがあるため UUID を採用している
    expect(record!.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  test('正答率が正しく計算される: 68/80 → 85.0', () => {
    const record = createRecord({
      date: '2026-02-15',
      total: 80,
      correct: 68,
    });

    expect(record!.rate).toBe(85.0);
  });

  test('戻り値に必要なプロパティがすべて存在する', () => {
    // TypeScript の型はランタイムで消えるため、プロパティの存在をランタイムで検証する
    const record = createRecord({
      date: '2026-02-15',
      total: 50,
      correct: 42,
    });

    expect(record).not.toBeNull();
    expect(record).toHaveProperty('id');
    expect(record).toHaveProperty('date', '2026-02-15');
    expect(record).toHaveProperty('total', 50);
    expect(record).toHaveProperty('correct', 42);
    expect(record).toHaveProperty('rate', 84.0);
    expect(record).toHaveProperty('createdAt');
  });

  test('作成後 getAllRecords() に反映されること', () => {
    createRecord({ date: '2026-02-15', total: 50, correct: 42 });

    expect(getAllRecords()).toHaveLength(1);
  });
});

// ========== getAllRecords() ==========

describe('getAllRecords', () => {
  test('初期状態: 空配列を返す', () => {
    expect(getAllRecords()).toEqual([]);
  });

  test('記録を追加した後は追加した記録を返す', () => {
    createRecord({ date: '2026-02-15', total: 50, correct: 42 });
    createRecord({ date: '2026-02-16', total: 80, correct: 68 });

    expect(getAllRecords()).toHaveLength(2);
  });

  test('LocalStorage が空の場合: 空配列を返す', () => {
    // clearAllData() 後に直接確認
    expect(getAllRecords()).toEqual([]);
  });
});

// ========== getLatestRecord() ==========

describe('getLatestRecord', () => {
  test('0件の場合: null を返す', () => {
    expect(getLatestRecord()).toBeNull();
  });

  test('複数件の場合: 日付が最も新しい記録を返す', () => {
    createRecord({ date: '2026-02-14', total: 50, correct: 38 });
    createRecord({ date: '2026-02-16', total: 80, correct: 68 });
    createRecord({ date: '2026-02-15', total: 50, correct: 42 });

    const latest = getLatestRecord();
    // 最新日付（2026-02-16）の記録が返ること
    expect(latest!.date).toBe('2026-02-16');
  });

  test('同日に複数件ある場合: createdAt が最も新しい記録を返す', () => {
    // 同一ミリ秒内の連続呼び出しでは createdAt が同値になりソート結果が不定になる。
    // vi.useFakeTimers() で時刻を制御し、2件目を 1 秒後に作成したことにする。
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T10:00:00.000Z'));
    const first = createRecord({ date: '2026-02-15', total: 50, correct: 30 });

    vi.setSystemTime(new Date('2026-02-15T10:00:01.000Z'));
    const second = createRecord({ date: '2026-02-15', total: 50, correct: 42 });

    vi.useRealTimers();

    const latest = getLatestRecord();
    // 後から作成した記録（createdAt が新しい）が返ること
    expect(latest!.id).toBe(second!.id);
    // 先に作成した記録は返らないこと
    expect(latest!.id).not.toBe(first!.id);
  });
});

// ========== deleteRecord() ==========

describe('deleteRecord', () => {
  test('記録を削除できる（設計書 8.2）', () => {
    const record = createRecord({ date: '2026-02-15', total: 50, correct: 42 });

    const result = deleteRecord(record!.id);

    expect(result).toBe(true);
    expect(getAllRecords()).toHaveLength(0);
  });

  test('存在しない ID の削除は false を返す（設計書 8.2）', () => {
    // 二重削除などのバグ検出のために false を返す設計
    const result = deleteRecord('non-existent-id');

    expect(result).toBe(false);
  });

  test('削除後に残りの記録が正しく残っていること', () => {
    const r1 = createRecord({ date: '2026-02-14', total: 50, correct: 38 });
    const r2 = createRecord({ date: '2026-02-15', total: 50, correct: 42 });

    deleteRecord(r1!.id);

    const remaining = getAllRecords();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(r2!.id);
  });
});

// ========== getSortedRecords() ==========

describe('getSortedRecords', () => {
  test('日付降順に並んでいること', () => {
    createRecord({ date: '2026-02-15', total: 50, correct: 42 });
    createRecord({ date: '2026-02-16', total: 80, correct: 68 });
    createRecord({ date: '2026-02-14', total: 50, correct: 38 });

    const sorted = getSortedRecords();

    expect(sorted[0].date).toBe('2026-02-16');
    expect(sorted[1].date).toBe('2026-02-15');
    expect(sorted[2].date).toBe('2026-02-14');
  });

  test('元の配列が破壊されていないこと', () => {
    // [...records].sort() を使うのは元の配列を変更しないため。
    // getAllRecords() が返した配列が sort によって並び変わると
    // 別の呼び出し箇所に副作用が出るバグを防いでいる。
    createRecord({ date: '2026-02-15', total: 50, correct: 42 });
    createRecord({ date: '2026-02-16', total: 80, correct: 68 });

    const before = getAllRecords();
    const beforeFirst = before[0].id;

    getSortedRecords(); // ソートを実行

    // getAllRecords() が再度呼ばれたとき、元の順序が維持されていること
    const after = getAllRecords();
    expect(after[0].id).toBe(beforeFirst);
  });
});
