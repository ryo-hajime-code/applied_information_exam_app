// src/services/calculator.ts
// 正答率・前回比の計算ロジックを純粋関数として集約する。
// UI層に計算ロジックを持たせると再利用・テストが困難になるため、このファイルに分離する。

import type { PracticeRecord } from '../types';

// 正答率を計算する。
export function calculateRate(correct: number, total: number): number {
  // total === 0 のとき、0で割ることを防ぐ
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

// 正答率の前回比を計算する。
export function calculateComparison(currentRate: number, previousRate: number): number {
  return Math.round((currentRate - previousRate) * 10) / 10;
}

/**
 * 全記録に対して前回比を一括計算する。（各記録に前回比を表示する）
 *
 * 引数がソート済みであることを前提とする。ソート処理を storage.ts に任せることで
 * この関数は「配列のどの位置が『前回』か」だけに責務を絞っている。
 */
export function calculateComparisons(sortedRecords: PracticeRecord[]): (number | null)[] {
  return sortedRecords.map((record, index) => {
    // sortedRecords.length - 1は、配列の一番最後という意味。前回比は存在しないため null を返す。
    if (index === sortedRecords.length - 1) return null;
    //  1つ前の記録が index + 1 になるのは、配列が日付降順だから。一番最近が配列の0番目。
    const previous = sortedRecords[index + 1];
    // 今回の正答率と前回の正答率をcalculateComparison() に渡して差分を計算する
    return calculateComparison(record.rate, previous.rate);
  });
}
