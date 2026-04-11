// src/utils/validation.ts の入力バリデーション関数のユニットテスト。
//
// 純粋関数のみを対象とするため LocalStorage・DOM は不要。
// jsdom 環境アノテーションなしで実行できる（Node.js デフォルト環境）。
//
// validateSettings() の「今日以降」判定はテスト実行日に依存するため、
// vi.setSystemTime() で日付を固定し、再現性のあるテストにする。

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateRecord, validateSettings } from './validation';

// テスト内で「今日」として扱う固定日付
// vi.setSystemTime() に渡すことでテスト実行日に依存しなくなる
const FIXED_TODAY = new Date('2026-04-12T00:00:00.000Z');

// ========== validateRecord() ==========

describe('validateRecord', () => {
  test('正常ケース: 全フィールドが有効な値', () => {
    const result = validateRecord({ date: '2026-04-12', total: 80, correct: 68 });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  // --- date バリデーション ---

  test('エラーケース: date が空文字', () => {
    const result = validateRecord({ date: '', total: 80, correct: 68 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('実施日を入力してください');
  });

  test('エラーケース: date が YYYY-MM-DD 以外の形式（スラッシュ区切り）', () => {
    const result = validateRecord({ date: '2026/04/12', total: 80, correct: 68 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('日付はYYYY-MM-DD形式で入力してください');
  });

  test('エラーケース: date が不正文字列', () => {
    const result = validateRecord({ date: 'not-a-date', total: 80, correct: 68 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('日付はYYYY-MM-DD形式で入力してください');
  });

  // --- total バリデーション ---

  test('エラーケース: total が 0（下限未満）', () => {
    const result = validateRecord({ date: '2026-04-12', total: 0, correct: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('解いた問題数は1以上にしてください');
  });

  test('エラーケース: total が 201（上限超過）', () => {
    // 上限200は応用情報午前（80問）より余裕を持たせつつ誤入力を防ぐ設計値
    const result = validateRecord({ date: '2026-04-12', total: 201, correct: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('解いた問題数は200以下にしてください');
  });

  test('境界値: total === 1（下限）→ 有効', () => {
    const result = validateRecord({ date: '2026-04-12', total: 1, correct: 0 });
    expect(result.valid).toBe(true);
  });

  test('境界値: total === 200（上限）→ 有効', () => {
    const result = validateRecord({ date: '2026-04-12', total: 200, correct: 0 });
    expect(result.valid).toBe(true);
  });

  // --- correct バリデーション ---

  test('エラーケース: correct が -1（負の値）', () => {
    const result = validateRecord({ date: '2026-04-12', total: 80, correct: -1 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('正答数は0以上にしてください');
  });

  test('エラーケース: correct が total を超過', () => {
    const result = validateRecord({ date: '2026-04-12', total: 50, correct: 51 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('正答数が解いた問題数を超えています');
  });

  test('境界値: correct === 0（0点）→ 有効', () => {
    const result = validateRecord({ date: '2026-04-12', total: 50, correct: 0 });
    expect(result.valid).toBe(true);
  });

  test('境界値: correct === total（満点）→ 有効', () => {
    const result = validateRecord({ date: '2026-04-12', total: 50, correct: 50 });
    expect(result.valid).toBe(true);
  });
});

// ========== validateSettings() ==========

describe('validateSettings', () => {
  // validateSettings() は new Date() で「今日」を取得するため、
  // 実行日に依存しないよう beforeEach / afterEach でシステム時刻を固定する
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('正常ケース: 有効な将来の日付', () => {
    const result = validateSettings({ examDate: '2026-05-01' });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('正常ケース: examDate が null（受験日未設定）', () => {
    // null は「受験日なし」として有効とみなす設計
    const result = validateSettings({ examDate: null });
    expect(result.valid).toBe(true);
  });

  test('正常ケース: examDate が空文字（"" は falsy → null と同じ挙動）', () => {
    // TypeScript 型上は string だが、実装の if (settings.examDate) が falsy 評価するため
    // null と同じく日付チェックをスキップして valid: true になる。
    // この暗黙の挙動をテストで明示的に記録しておく。
    const result = validateSettings({ examDate: '' });
    expect(result.valid).toBe(true);
  });

  test('エラーケース: 過去の日付', () => {
    const result = validateSettings({ examDate: '2026-01-01' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('受験日は今日以降の日付にしてください');
  });

  test('エラーケース: 不正形式の日付（スラッシュ区切り）', () => {
    const result = validateSettings({ examDate: '2026/05/01' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('日付はYYYY-MM-DD形式で入力してください');
  });

  test('境界値: examDate が今日（2026-04-12）→ 有効', () => {
    // 実装は today.setHours(0,0,0,0) で時刻を切り捨てて比較するため
    // examDate < today の条件を満たさず、当日は通過する
    const result = validateSettings({ examDate: '2026-04-12' });
    expect(result.valid).toBe(true);
  });

  test('境界値: examDate が昨日（2026-04-11）→ 無効', () => {
    // examDate < today を満たすため無効
    const result = validateSettings({ examDate: '2026-04-11' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('受験日は今日以降の日付にしてください');
  });

  test('境界値: examDate が明日（2026-04-13）→ 有効', () => {
    const result = validateSettings({ examDate: '2026-04-13' });
    expect(result.valid).toBe(true);
  });
});
