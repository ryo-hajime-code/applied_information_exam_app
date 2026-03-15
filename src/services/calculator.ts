// src/services/calculator.ts
// 正答率・前回比の計算ロジックを純粋関数として集約する。
// UI層に計算ロジックを持たせると再利用・テストが困難になるため、このファイルに分離する。
// 副作用なし・外部状態への依存なし。

import type { PracticeRecord } from '../types';

/**
 * 正答率を計算する。
 *
 * * 1000 して / 10 する二段階計算にしているのは、
 * `Math.round((correct / total) * 100) / 100` だと小数第1位に丸まらず
 * 浮動小数点誤差が出るケースがあるため。
 * 例: Math.round((42 / 50) * 1000) / 10 → 84.0
 *
 * total === 0 のガードを入れているのは、ゼロ除算で Infinity や NaN が
 * LocalStorage に保存されてデータが壊れるのを防ぐため。
 */
export function calculateRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

/**
 * 2つの正答率の差分（前回比）を計算する。
 *
 * `currentRate - previousRate` をそのまま返さず丸めるのは、
 * 浮動小数点演算の誤差で 1.0000000000001 のような値になるのを防ぐため。
 * 正答率が小数第1位までなので、差分も同じ精度に揃える。
 */
export function calculateComparison(currentRate: number, previousRate: number): number {
  return Math.round((currentRate - previousRate) * 10) / 10;
}

/**
 * ソート済みレコード配列の全レコードに対して前回比を一括計算する。
 *
 * 引数がソート済みであることを前提とする。ソート処理を storage.ts に任せることで
 * この関数は「配列のどの位置が『前回』か」だけに責務を絞っている。
 *
 * 最後の要素（最も古い記録）は前回が存在しないため null を返す。
 * index + 1 が「1つ前の記録」になるのは、配列が日付降順だから。
 */
export function calculateComparisons(sortedRecords: PracticeRecord[]): (number | null)[] {
  return sortedRecords.map((record, index) => {
    if (index === sortedRecords.length - 1) return null;
    const previous = sortedRecords[index + 1];
    return calculateComparison(record.rate, previous.rate);
  });
}
