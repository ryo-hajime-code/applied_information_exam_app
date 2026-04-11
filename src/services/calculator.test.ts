// src/services/calculator.test.ts
// calculator.ts の純粋関数のユニットテスト。
// 副作用なし・モック不要なので、関数を直接呼び出してアサートするだけでよい。

// なお、以下の理由でテストファイルはソースファイルと同じディレクトリに置く。
// ・変更時に対象が一目瞭然: calculator.ts を変更したら隣の calculator.test.ts を見ればいい
// ・Vitest のデフォルト規約: *.test.ts をソースの隣に置くのが Vite/Vitest エコシステムの慣習
// ・ファイル移動が安全: calculator.ts を別ディレクトリに移すとき、テストも一緒に移せる

import { describe, test, expect } from 'vitest';
import { calculateRate, calculateComparison, calculateComparisons } from './calculator';
import type { PracticeRecord } from '../types';

describe('calculateRate', () => {
  test('正常ケース: 42/50 → 84.0', () => {
    expect(calculateRate(42, 50)).toBe(84.0);
  });

  test('正常ケース: 68/80 → 85.0', () => {
    expect(calculateRate(68, 80)).toBe(85.0);
  });

  test('ゼロ除算: total=0 のとき Infinity/NaN でなく 0 を返す', () => {
    // LocalStorage にゼロ除算の結果が保存されてデータが壊れるのを防ぐため 0 を返す
    expect(calculateRate(0, 0)).toBe(0);
  });

  test('0点: correct=0 → 0.0', () => {
    expect(calculateRate(0, 50)).toBe(0.0);
  });

  test('満点: correct=total → 100.0', () => {
    expect(calculateRate(50, 50)).toBe(100.0);
  });

  test('四捨五入: 1/3 → 33.3 (小数第2位を四捨五入)', () => {
    // 33.333... → 小数第1位まで丸める → 33.3
    expect(calculateRate(1, 3)).toBe(33.3);
  });
});

describe('calculateComparison', () => {
  test('正の差分: 85.0 - 84.0 → 1.0', () => {
    expect(calculateComparison(85.0, 84.0)).toBe(1.0);
  });

  test('負の差分: 76.0 - 84.0 → -8.0', () => {
    expect(calculateComparison(76.0, 84.0)).toBe(-8.0);
  });

  test('変化なし: 84.0 - 84.0 → 0.0', () => {
    expect(calculateComparison(84.0, 84.0)).toBe(0.0);
  });
});

describe('calculateComparisons', () => {
  test('ソート済み3件: 前回比が正しく計算され、最後の要素は null', () => {
    // 配列は日付降順（最新が先頭）であることが前提
    // index+1 が「1つ前の記録」になる
    const records: PracticeRecord[] = [
      { id: '1', date: '2026-02-16', total: 80, correct: 68, rate: 85.0, createdAt: '2026-02-16T09:00:00.000Z' },
      { id: '2', date: '2026-02-15', total: 50, correct: 42, rate: 84.0, createdAt: '2026-02-15T10:00:00.000Z' },
      { id: '3', date: '2026-02-14', total: 50, correct: 38, rate: 76.0, createdAt: '2026-02-14T14:00:00.000Z' },
    ];

    const comparisons = calculateComparisons(records);
    expect(comparisons).toEqual([1.0, 8.0, null]);
  });

  test('最後の要素は必ず null（前回記録が存在しないため）', () => {
    const records: PracticeRecord[] = [
      { id: '1', date: '2026-02-16', total: 50, correct: 42, rate: 84.0, createdAt: '2026-02-16T09:00:00.000Z' },
    ];

    const comparisons = calculateComparisons(records);
    expect(comparisons).toEqual([null]);
  });

  test('空配列 → 空配列', () => {
    expect(calculateComparisons([])).toEqual([]);
  });
});
