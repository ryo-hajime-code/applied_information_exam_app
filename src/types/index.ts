// src/types/index.ts
// すべての型定義をここに一元管理する。
// 分散させると型の不整合が起きやすいため、全コンポーネント・サービスはここからimportする。

// ========== データ型 ==========

/**
 * 過去問演習の記録。
 * 「Record」ではなく「PracticeRecord」としているのは、TypeScript標準の
 * ユーティリティ型 Record<K,V> と名前が衝突してコンパイルエラーを招くため。
 */
export interface PracticeRecord {
  /**
   * crypto.randomUUID() で生成するUUID v4。
   * Date.now() ベースのIDを避けているのは、高速に連続記録した場合に
   * ミリ秒が衝突してIDが重複するリスクがあるため。
   */
  id: string;

  /**
   * ユーザーが指定する「実施日」(YYYY-MM-DD形式)。
   * createdAt と別フィールドを持つのは、後日まとめて記録するケースに対応するため。
   * (例: 昨日やった演習を今日登録する)
   */
  date: string;

  /** 解いた問題数。応用情報午前は80問だが、余裕を持たせ上限200とする。 */
  total: number;

  /** 正答した問題数。0以上かつtotal以下の整数。 */
  correct: number;

  /**
   * 計算で求められるが、あえて保存する。
   * 表示の一貫性のため。ただし更新時は必ず再計算すること。
   * 計算式: Math.round((correct / total) * 1000) / 10 (小数第1位まで)
   */
  rate: number;

  /**
   * システムが自動付与する「記録作成日時」(ISO 8601形式)。
   * date(実施日)と分けているのは、同日に複数記録した場合の並び順を
   * createdAt降順で確定させるため。
   */
  createdAt: string;
}

/**
 * 記録作成時にユーザーから受け取るデータ。
 * id / rate / createdAt はシステムが自動生成するため含めない。
 * PracticeRecord と分けることで、フォームの入力値とDBレコードの責務を明確に分離する。
 */
export interface RecordInput {
  date: string;
  total: number;
  correct: number;
}

/**
 * アプリ設定。
 * examDate を string | null にしているのは、未設定状態を明示的に表現するため。
 * undefined ではなく null を使うのは、JSON.stringify/parse で値が消えないようにするため。
 */
export interface Settings {
  examDate: string | null;
}

/**
 * LocalStorage に保存するレコードデータの構造。
 * version フィールドを初回から含めるのは、後から追加すると
 * versionあり/なしのデータが混在して起動時のマイグレーション処理が複雑になるため。
 */
export interface StorageData {
  /** スキーマバージョン。将来のデータ構造変更時にマイグレーション判定に使う。 */
  version: string;
  records: PracticeRecord[];
}

// ========== ユーティリティ型 ==========

/**
 * バリデーション結果。
 * boolean だけを返さず error メッセージを一緒に持つことで、
 * 呼び出し側が別途エラー文言を管理しなくて済む。
 */
export interface ValidationResult {
  valid: boolean;
  /** 失敗時のみ存在する。成功時は undefined。 */
  error?: string;
}

/**
 * 記録一覧画面のサマリー表示に使う統計情報。
 * 計算ロジック(calculator.ts)の返り値として使うことで、
 * UIが計算の詳細を知らずに済む。
 */
export interface RecordStats {
  averageRate: number;
  totalCount: number;
}

// ========== Union型 ==========

/**
 * 前回比の状態を3値で表す。
 * 数値(number)のままUIに渡すと、コンポーネント側で正負の分岐ロジックが重複するため
 * 文字列リテラル型に変換して渡す。
 */
export type ComparisonStatus = 'improved' | 'declined' | 'unchanged';

/**
 * 記録のソート順。現時点は日付降順のみ使用するが、
 * 将来のUI拡張(並び替えオプション追加)に備えて型定義だけ用意する。
 */
export type SortOrder = 'date-desc' | 'date-asc' | 'rate-desc' | 'rate-asc';

// ========== 定数 ==========

/**
 * LocalStorage のキー名を定数化する。
 * プレフィックス "past_exam_" を付けているのは、同一ドメインで他のアプリが動く場合の
 * キー衝突を避けるため。
 * as const にして StorageKey 型を導出することで、文字列リテラルを直書きするミスを防ぐ。
 */
export const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;

/** STORAGE_KEYS の値のユニオン型。storage.ts で引数の型として使う。 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ========== React コンポーネント Props ==========

/**
 * RecordForm は PracticeRecord を返す。
 * RecordInput ではなく PracticeRecord を返すのは、id/rate/createdAt の付与を
 * フォーム内部(または呼び出し前)で完結させ、親コンポーネントの責務を減らすため。
 */
export interface RecordFormProps {
  onSubmit: (record: PracticeRecord) => void;
}

/**
 * RecordCard は1件の記録と前回比を受け取る。
 * comparison を null 許容にしているのは、最も古い記録には前回が存在しないため。
 */
export interface RecordCardProps {
  record: PracticeRecord;
  comparison: number | null;
  /** 削除ボタン押下時に id だけ渡す。レコード全体を渡さないのは最小限のデータで済むため。 */
  onDelete: (id: string) => void;
}

/**
 * CountDown は受験日の表示と変更を担う。
 * examDate の変更コールバックを null 許容にしているのは、
 * 受験日を「未設定に戻す」操作をサポートするため。
 */
export interface CountDownProps {
  examDate: string | null;
  onExamDateChange: (date: string | null) => void;
}

/**
 * ComparisonDisplay は前回比の値を受け取り表示するだけ。
 * null を受け取らないのは、呼び出し側で null チェックをしてから表示制御するため。
 */
export interface ComparisonDisplayProps {
  comparison: number;
}

/**
 * ConfirmDialog は削除確認に使う汎用ダイアログ。
 * message を Props として受け取るのは、削除対象によってメッセージを変えられるようにするため。
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Toast は操作完了通知に使う。
 * type を 'success' | 'info' に限定することで、
 * UIのスタイル分岐を型で保証する。
 */
export interface ToastProps {
  message: string;
  isVisible: boolean;
  type: 'success' | 'info';
}

// ========== 型ガード ==========

/**
 * LocalStorage から読み込んだデータが PracticeRecord 型かどうかを実行時に検証する。
 * LocalStorage の値は JSON.parse 後に unknown 型になるため、
 * 型アサーション(as PracticeRecord)ではなく型ガードで安全性を保証する。
 */
export function isPracticeRecord(obj: unknown): obj is PracticeRecord {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    typeof r.total === 'number' &&
    typeof r.correct === 'number' &&
    typeof r.rate === 'number' &&
    typeof r.createdAt === 'string'
  );
}

/**
 * オブジェクトが RecordInput 型かどうかを実行時に検証する。
 * isPracticeRecord と異なり id/rate/createdAt を含まない点に注意。
 */
export function isRecordInput(obj: unknown): obj is RecordInput {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    typeof r.total === 'number' &&
    typeof r.correct === 'number'
  );
}

// ========== ヘルパー関数 ==========

/**
 * 前回比の数値から ComparisonStatus を導出する。
 * 各コンポーネントが独自に正負判定を書くと実装が分散するため、ここに集約する。
 */
export function getComparisonStatus(comparison: number): ComparisonStatus {
  if (comparison > 0) return 'improved';
  if (comparison < 0) return 'declined';
  return 'unchanged';
}
