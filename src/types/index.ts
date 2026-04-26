// src/types/index.ts
// すべての型定義をここに一元管理する。
// 分散させると型の不整合が起きやすいため、全コンポーネント・サービスはここからimportする。

// ========== データ型 ==========

/**
 * 過去問演習の記録。
 */
export interface PracticeRecord {
  /** データのID */
  id: string;

  /** 過去問の実施日(YYYY-MM-DD形式) */
  date: string;

  /** 解いた問題数。0以上 */
  total: number;

  /** 正答した問題数。0以上かつtotal以下の整数。 */
  correct: number;

  /** 正答率 */
  rate: number;

  /** 
   * 記録作成日時
   * date(実施日)と分けているのは、同日に複数記録した場合の並び順をcreatedAt降順で確定させるため。
   */
  createdAt: string;
}

/**
 * 記録作成時に入力するデータ。
 * id / rate / createdAt はシステムが自動で計算・生成するためここには含めない。
 * PracticeRecord と分けることで、フォームの入力値とDBレコードの責務を明確に分離する。
 */
export interface RecordInput {
  date: string;
  total: number;
  correct: number;
}

/**
 * アプリ設定。
 * 2026年4月時点では受験日のみ。しかし、今後つけ足す可能性あり
 * 試験日が未設定のときはnullとなる。
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
 * 今までの記録から平均正答率と合計値を表示する。
 * 計算ロジック(calculator.ts)の返り値として使うことで、
 * UIが計算の詳細を知らずに済む。
 */
export interface RecordStats {
  averageRate: number;
  totalCount: number;
}

// ========== Union型 ==========

/**
 * 前回からの正答率の変化を「前回比」とし、向上・下降・変化なしの3状態で表す。
 * 数値(number)のままUIに渡すと、コンポーネント側で正負の分岐ロジックが重複するため
 * 文字列に変換して渡す。
 */
export type ComparisonStatus = 'improved' | 'declined' | 'unchanged';

/**
 * 記録のソート順。現時点は日付降順のみ使用するが、
 * 将来の拡張(並び替えオプション追加)に備えて型定義だけ用意する。
 */
export type SortOrder = 'date-desc' | 'date-asc' | 'rate-desc' | 'rate-asc';

// ========== 定数 ==========

/**
 * LocalStorage に保存する記録のラベル名を定数化する。
 * storage.ts で localStorage.setItem(STORAGE_KEYS.RECORDS) とか localStorage.getItem(STORAGE_KEYS.RECORDS) とかをしている。
 * これは、past_exam_records　という名前で LocalStorage にデータを保存します/取り出します。のやり取りをしている。
 */
export const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;

/**
 * type StorageKey = 'past_exam_records' | 'past_exam_settings' と同じ意味。
 * STORAGE_KEYS に新しいキーを追加したときでも対応できるようにこの書き方をする。
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ========== React コンポーネント Props ==========

/**
 * 過去問実施日・回答数・正答数を入力するフォームの型定義
 * RecordInput ではなく PracticeRecord を返すのは、id/rate/createdAt の付与を
 * フォーム内部(または呼び出し前)で完結させ、親コンポーネントの責務を減らすため。
 * RecordForm.tsxのコードを追うと、storage.ts でこれらを計算していることがわかる。
 */
export interface RecordFormProps {
  onSubmit: (record: PracticeRecord) => void;
}

/**
 * 過去問実施の記録1件あたりの型定義
 * PracticeRecord型の記録と、前回との比較、削除ボタン
 * comparison を null 許容にしているのは、最も古い記録には前回が存在しないため。
 */
export interface RecordCardProps {
  record: PracticeRecord;
  comparison: number | null;
  /** 削除ボタン押下時に id だけ渡す。レコード全体を渡さないのは最小限のデータで済むため。 */
  onDelete: (id: string) => void;
}

/**
 * Home画面上部に表示する、「受験日まで○日」の型定義
 * 受験日の変更もここで行う。
 * examDate の変更コールバックを null 許容にしているのは、受験日を「未設定に戻す」操作をサポートするため。
 */
export interface CountDownProps {
  examDate: string | null;
  onExamDateChange: (date: string | null) => void;
}

/**
 * 記録登録時に前回比を表示するコンポーネントの型定義
 * このコンポーネントは表示するだけ。
 * null を受け取らないのは、呼び出し側で null チェックをしてから表示制御するため。
 */
export interface ComparisonDisplayProps {
  comparison: number;
}

/**
 * 記録削除時の確認用ダイアログの型定義
 * message を Props として受け取るのは、削除対象によってメッセージを変えられるようにするため。
*/
export interface ConfirmDialogProps {
  // isOpenは「今開いているかどうか」。削除ボタンを押して「削除しますか？」の表示が出ていればtrueになる
  isOpen: boolean;

  // messageは「削除しますか？」のメッセージ
  message: string;

  // 削除確定のボタン
  onConfirm: () => void;

  // やっぱり削除しないのボタン
  onCancel: () => void;
}

/**
 * ボタン等で画面を操作したらしたからフワッと出てくるコンポーネントの型定義
 * 操作完了通知に使う。
 * Homeでは記録登録時、RecordListでは記録削除時に出てくる。
 * それぞれのtype は 'success' | 'info' になっている。
 */
export interface ToastProps {
  message: string;
  isVisible: boolean;
  type: 'success' | 'info';
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
