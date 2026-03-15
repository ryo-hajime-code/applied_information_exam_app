// src/utils/validation.ts
// バリデーションロジックをUI層から分離することで、同じルールをフォームとサービス層で
// 一貫して適用できる。ValidationResult 型を返すことで呼び出し側がエラー文言を
// 別途管理しなくて済む（03_database.md セクション7参照）。

import type { RecordInput, Settings, ValidationResult } from '../types';

/**
 * PracticeRecord 作成時の入力バリデーション。
 *
 * なぜこの順番でチェックするか:
 * - 日付 → total → correct の順にチェックすることで、
 *   数値フィールドが存在しない状態で比較演算が走ることを防ぐ。
 * - correct > total のチェックは total の存在が確定してから行う。
 */
export function validateRecord(input: RecordInput): ValidationResult {
  // 日付: 必須 + YYYY-MM-DD 形式チェック
  if (!input.date) {
    return { valid: false, error: '実施日を入力してください' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' };
  }

  // total: 1以上200以下の整数チェック
  // 上限200は応用情報午前（80問）より余裕を持たせつつ、誤入力を防ぐための設計値。
  if (!Number.isInteger(input.total) || input.total < 1) {
    return { valid: false, error: '解いた問題数は1以上にしてください' };
  }

  if (input.total > 200) {
    return { valid: false, error: '解いた問題数は200以下にしてください' };
  }

  // correct: 0以上かつtotal以下の整数チェック
  if (!Number.isInteger(input.correct) || input.correct < 0) {
    return { valid: false, error: '正答数は0以上にしてください' };
  }

  if (input.correct > input.total) {
    return { valid: false, error: '正答数が解いた問題数を超えています' };
  }

  return { valid: true };
}

/**
 * Settings 更新時のバリデーション。
 *
 * examDate が null の場合は「受験日なし」として有効とみなす。
 * examDate が設定されている場合のみ形式チェック・未来日付チェックを行う。
 *
 * なぜ「今日以降」を許容するか:
 * - 今日が試験日の場合も設定できるようにするため（当日も有効とする）。
 * - today.setHours(0,0,0,0) で時刻を切り捨てて日付単位で比較する。
 */
export function validateSettings(settings: Partial<Settings>): ValidationResult {
  if (settings.examDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(settings.examDate)) {
      return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' };
    }

    const examDate = new Date(settings.examDate);
    const today = new Date();
    // 時刻を切り捨てて日付単位で比較する（当日も有効）
    today.setHours(0, 0, 0, 0);

    if (examDate < today) {
      return { valid: false, error: '受験日は今日以降の日付にしてください' };
    }
  }

  return { valid: true };
}
