# TypeScript型定義

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026-02-14 | 初版作成 |
| 2.0.0 | 2026-02-25 | レビュー指摘反映: Record→PracticeRecord改名(TS標準との衝突回避)、StorageData型追加、関数型定義の整理、削除関連Props追加 |

---

**ファイル配置**: `src/types/index.ts`

---

## 1. データ型定義

### 1.1 PracticeRecord(過去問記録)

```typescript
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
```

### 1.2 RecordInput(記録作成時の入力)

```typescript
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
```

### 1.3 Settings(アプリ設定)

```typescript
/**
 * アプリの設定
 */
export interface Settings {
  /** 受験予定日 (YYYY-MM-DD形式、未設定の場合はnull) */
  examDate: string | null;
}
```

### 1.4 StorageData(ストレージ構造)

```typescript
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
```

---

## 2. ユーティリティ型

### 2.1 バリデーション結果

```typescript
/**
 * バリデーション結果
 */
export interface ValidationResult {
  /** バリデーションが成功したか */
  valid: boolean;

  /** エラーメッセージ(失敗時のみ) */
  error?: string;
}
```

### 2.2 統計情報

```typescript
/**
 * 記録の統計情報
 */
export interface RecordStats {
  /** 平均正答率(%) */
  averageRate: number;

  /** 総演習回数 */
  totalCount: number;
}
```

---

## 3. Reactコンポーネントのプロパティ型

### 3.1 RecordFormProps

```typescript
/**
 * 記録入力フォームのProps
 */
export interface RecordFormProps {
  /** 記録追加時のコールバック */
  onSubmit: (record: PracticeRecord) => void;
}
```

### 3.2 RecordCardProps

```typescript
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
```

### 3.3 CountDownProps

```typescript
/**
 * カウントダウン表示のProps
 */
export interface CountDownProps {
  /** 受験予定日(未設定の場合はnull) */
  examDate: string | null;

  /** 受験日更新時のコールバック */
  onExamDateChange: (date: string | null) => void;
}
```

### 3.4 ComparisonDisplayProps

```typescript
/**
 * 前回比表示のProps
 */
export interface ComparisonDisplayProps {
  /** 前回比の値 */
  comparison: number;
}
```

### 3.5 ConfirmDialogProps

```typescript
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
```

### 3.6 ToastProps

```typescript
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
```

---

## 4. Union型 / 定数

### 4.1 比較結果の種類

```typescript
/**
 * 前回比の状態
 */
export type ComparisonStatus = 'improved' | 'declined' | 'unchanged';
```

### 4.2 ソート順(将来用)

```typescript
/**
 * 記録のソート順
 */
export type SortOrder = 'date-desc' | 'date-asc' | 'rate-desc' | 'rate-asc';
```

### 4.3 ストレージキー

```typescript
/**
 * LocalStorageのキー名
 */
export const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

---

## 5. 型ガード

### 5.1 PracticeRecord型チェック

```typescript
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
```

### 5.2 RecordInput型チェック

```typescript
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
```

---

## 6. ヘルパー関数

```typescript
/**
 * 前回比の値から状態を判定
 */
export function getComparisonStatus(comparison: number): ComparisonStatus {
  if (comparison > 0) return 'improved';
  if (comparison < 0) return 'declined';
  return 'unchanged';
}
```

---

## 7. 型定義ファイルの完全版

```typescript
// src/types/index.ts

// ========== データ型 ==========
export interface PracticeRecord {
  id: string;
  date: string;
  total: number;
  correct: number;
  rate: number;
  createdAt: string;
}

export interface RecordInput {
  date: string;
  total: number;
  correct: number;
}

export interface Settings {
  examDate: string | null;
}

export interface StorageData {
  version: string;
  records: PracticeRecord[];
}

// ========== ユーティリティ型 ==========
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface RecordStats {
  averageRate: number;
  totalCount: number;
}

// ========== Union型 ==========
export type ComparisonStatus = 'improved' | 'declined' | 'unchanged';
export type SortOrder = 'date-desc' | 'date-asc' | 'rate-desc' | 'rate-asc';

// ========== 定数 ==========
export const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ========== Reactコンポーネント Props ==========
export interface RecordFormProps {
  onSubmit: (record: PracticeRecord) => void;
}

export interface RecordCardProps {
  record: PracticeRecord;
  comparison: number | null;
  onDelete: (id: string) => void;
}

export interface CountDownProps {
  examDate: string | null;
  onExamDateChange: (date: string | null) => void;
}

export interface ComparisonDisplayProps {
  comparison: number;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ToastProps {
  message: string;
  isVisible: boolean;
  type: 'success' | 'info';
}

// ========== 型ガード ==========
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
export function getComparisonStatus(comparison: number): ComparisonStatus {
  if (comparison > 0) return 'improved';
  if (comparison < 0) return 'declined';
  return 'unchanged';
}
```
