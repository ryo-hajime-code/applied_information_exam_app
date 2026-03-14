// src/types/index.ts

// ========== データ型 ==========

/**
 * 過去問演習の記録
 * 旧名: Record（TypeScript標準のRecord<K,V>と衝突するため改名）
 */
export interface PracticeRecord {
  /** 一意の識別子 (UUID v4) */
  id: string;
  /** 実施日 (YYYY-MM-DD形式) */
  date: string;
  /** 解いた問題数 (1以上200以下) */
  total: number;
  /** 正答した問題数 (0以上、total以下) */
  correct: number;
  /** 正答率(%) 小数点第1位まで */
  rate: number;
  /** 記録作成日時 (ISO 8601形式) */
  createdAt: string;
}

/**
 * 記録作成時にユーザーから受け取るデータ
 * id, rate, createdAtは自動生成されるため不要
 */
export interface RecordInput {
  /** 実施日 (YYYY-MM-DD形式) */
  date: string;
  /** 解いた問題数 (1以上200以下) */
  total: number;
  /** 正答した問題数 (0以上、total以下) */
  correct: number;
}

/**
 * アプリの設定
 */
export interface Settings {
  /** 受験予定日 (YYYY-MM-DD形式、未設定の場合はnull) */
  examDate: string | null;
}

/**
 * LocalStorageに保存するレコードデータの構造
 * versionフィールドを初回から含め、将来のマイグレーションに対応
 */
export interface StorageData {
  /** データバージョン */
  version: string;
  /** 過去問記録の配列 */
  records: PracticeRecord[];
}

// ========== ユーティリティ型 ==========

/**
 * バリデーション結果
 */
export interface ValidationResult {
  /** バリデーションが成功したか */
  valid: boolean;
  /** エラーメッセージ(失敗時のみ) */
  error?: string;
}

/**
 * 記録の統計情報
 */
export interface RecordStats {
  /** 平均正答率(%) */
  averageRate: number;
  /** 総演習回数 */
  totalCount: number;
}

// ========== Union型 ==========

/**
 * 前回比の状態
 */
export type ComparisonStatus = 'improved' | 'declined' | 'unchanged';

/**
 * 記録のソート順
 */
export type SortOrder = 'date-desc' | 'date-asc' | 'rate-desc' | 'rate-asc';

// ========== 定数 ==========

/**
 * LocalStorageのキー名
 */
export const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ========== Reactコンポーネント Props ==========

/**
 * 記録入力フォームのProps
 */
export interface RecordFormProps {
  /** 記録追加時のコールバック */
  onSubmit: (record: PracticeRecord) => void;
}

/**
 * 記録カード(1件)のProps
 */
export interface RecordCardProps {
  /** 表示する記録 */
  record: PracticeRecord;
  /** 前回比(nullの場合は表示しない) */
  comparison: number | null;
  /** 削除ボタン押下時のコールバック */
  onDelete: (id: string) => void;
}

/**
 * カウントダウン表示のProps
 */
export interface CountDownProps {
  /** 受験予定日(未設定の場合はnull) */
  examDate: string | null;
  /** 受験日更新時のコールバック */
  onExamDateChange: (date: string | null) => void;
}

/**
 * 前回比表示のProps
 */
export interface ComparisonDisplayProps {
  /** 前回比の値 */
  comparison: number;
}

/**
 * 削除確認ダイアログのProps
 */
export interface ConfirmDialogProps {
  /** ダイアログを表示するか */
  isOpen: boolean;
  /** ダイアログのメッセージ */
  message: string;
  /** 確認ボタン押下時のコールバック */
  onConfirm: () => void;
  /** キャンセルボタン押下時のコールバック */
  onCancel: () => void;
}

/**
 * トースト通知のProps
 */
export interface ToastProps {
  /** 表示メッセージ */
  message: string;
  /** 表示するか */
  isVisible: boolean;
  /** 種類 */
  type: 'success' | 'info';
}

// ========== 型ガード ==========

/**
 * オブジェクトがPracticeRecord型かどうかをチェック
 * LocalStorageから読み込んだデータの検証に使用
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
 * オブジェクトがRecordInput型かどうかをチェック
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
 * 前回比の値から状態を判定
 */
export function getComparisonStatus(comparison: number): ComparisonStatus {
  if (comparison > 0) return 'improved';
  if (comparison < 0) return 'declined';
  return 'unchanged';
}
