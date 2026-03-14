# API設計書(データ操作関数)

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026-02-14 | 初版作成 |
| 2.0.0 | 2026-02-25 | レビュー指摘反映: PracticeRecord改名、deleteRecord()のMVP化、バージョン付きストレージ対応、前回比計算の一貫化、getComparisonForNewRecord削除、破壊的sortの修正、エクスポート優先度引き上げ |

---

## 1. 概要

LocalStorageを操作するための関数(内部API)を定義する。

**目的**:
- データアクセスロジックを一箇所に集約
- UI層からデータ層を分離
- テスト・保守を容易にする

**ファイル配置**:
- `src/services/storage.ts` — データ操作関数
- `src/services/calculator.ts` — 計算関数

---

## 2. 共通仕様

### 2.1 キー定義
```typescript
const STORAGE_KEYS = {
  RECORDS: 'past_exam_records',
  SETTINGS: 'past_exam_settings',
} as const;
```

### 2.2 ストレージ構造

`past_exam_records` はバージョン付きオブジェクトとして保存する:
```typescript
interface StorageData {
  version: string;
  records: PracticeRecord[];
}
```

### 2.3 エラーハンドリング
すべての関数は`try-catch`でエラーをハンドリングし、失敗時は`null`または空配列を返す。

---

## 3. PracticeRecord(記録)操作

### 3.1 getAllRecords()

全記録を取得する。

```typescript
function getAllRecords(): PracticeRecord[]
```

**戻り値**: 記録の配列。0件の場合は`[]`、エラー時も`[]`。

**実装例**:
```typescript
export function getAllRecords(): PracticeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return [];
    const data: StorageData = JSON.parse(raw);
    return data.records ?? [];
  } catch (error) {
    console.error('Failed to get records:', error);
    return [];
  }
}
```

---

### 3.2 createRecord(input)

新しい記録を追加する。

```typescript
function createRecord(input: RecordInput): PracticeRecord | null
```

**パラメータ**:
```typescript
{
  date: string;      // "YYYY-MM-DD"
  total: number;     // 1以上200以下の整数
  correct: number;   // 0以上、total以下の整数
}
```

**戻り値**: 成功時は作成された`PracticeRecord`、失敗時は`null`。

**実装例**:
```typescript
export function createRecord(input: RecordInput): PracticeRecord | null {
  try {
    const rate = calculateRate(input.correct, input.total);

    const newRecord: PracticeRecord = {
      id: crypto.randomUUID(),
      date: input.date,
      total: input.total,
      correct: input.correct,
      rate,
      createdAt: new Date().toISOString(),
    };

    const records = getAllRecords();
    records.push(newRecord);

    const data: StorageData = { version: '1.0.0', records };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));

    return newRecord;
  } catch (error) {
    console.error('Failed to create record:', error);
    return null;
  }
}
```

---

### 3.3 getLatestRecord()

最新の記録（日付が最も新しい記録）を取得する。

```typescript
function getLatestRecord(): PracticeRecord | null
```

**戻り値**: 最新の記録。記録が0件の場合は`null`。

**実装例**:
```typescript
export function getLatestRecord(): PracticeRecord | null {
  try {
    const records = getAllRecords();
    if (records.length === 0) return null;

    // 元の配列を破壊しないようスプレッド構文でコピー
    const sorted = [...records].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted[0];
  } catch (error) {
    console.error('Failed to get latest record:', error);
    return null;
  }
}
```

---

### 3.4 deleteRecord(id)

記録を削除する。**MVP機能**。

```typescript
function deleteRecord(id: string): boolean
```

**パラメータ**: `id` — 削除対象の記録ID

**戻り値**: 削除成功で`true`、失敗（IDが見つからない、エラー）で`false`。

**実装例**:
```typescript
export function deleteRecord(id: string): boolean {
  try {
    const records = getAllRecords();
    const filtered = records.filter(record => record.id !== id);

    if (filtered.length === records.length) {
      return false; // IDが見つからなかった
    }

    const data: StorageData = { version: '1.0.0', records: filtered };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));

    return true;
  } catch (error) {
    console.error('Failed to delete record:', error);
    return false;
  }
}
```

---

### 3.5 getRecordById(id) — 将来

特定の記録をIDで取得する。

```typescript
function getRecordById(id: string): PracticeRecord | null
```

**実装例**:
```typescript
export function getRecordById(id: string): PracticeRecord | null {
  try {
    const records = getAllRecords();
    return records.find(record => record.id === id) ?? null;
  } catch (error) {
    console.error('Failed to get record:', error);
    return null;
  }
}
```

---

### 3.6 updateRecord(id, updates) — 将来

既存の記録を更新する。

```typescript
function updateRecord(id: string, updates: Partial<RecordInput>): PracticeRecord | null
```

**実装例**:
```typescript
export function updateRecord(id: string, updates: Partial<RecordInput>): PracticeRecord | null {
  try {
    const records = getAllRecords();
    const index = records.findIndex(record => record.id === id);

    if (index === -1) return null;

    const updated: PracticeRecord = {
      ...records[index],
      ...updates,
    };

    // 正答率を再計算
    updated.rate = calculateRate(updated.correct, updated.total);

    records[index] = updated;

    const data: StorageData = { version: '1.0.0', records };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));

    return updated;
  } catch (error) {
    console.error('Failed to update record:', error);
    return null;
  }
}
```

---

## 4. Settings(設定)操作

### 4.1 getSettings()

アプリの設定を取得する。

```typescript
function getSettings(): Settings
```

**戻り値**: 設定オブジェクト。未保存の場合は`{ examDate: null }`。

**実装例**:
```typescript
export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { examDate: null };
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return { examDate: null };
  }
}
```

---

### 4.2 updateSettings(settings)

アプリの設定を更新する。

```typescript
function updateSettings(newSettings: Partial<Settings>): Settings | null
```

**実装例**:
```typescript
export function updateSettings(newSettings: Partial<Settings>): Settings | null {
  try {
    const current = getSettings();
    const updated: Settings = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return null;
  }
}
```

---

## 5. 計算関数

**ファイル配置**: `src/services/calculator.ts`

### 5.1 calculateRate(correct, total)

正答率を計算する。

```typescript
function calculateRate(correct: number, total: number): number
```

**実装例**:
```typescript
export function calculateRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}
```

---

### 5.2 calculateComparison(currentRate, previousRate)

前回との差分を計算する。

```typescript
function calculateComparison(currentRate: number, previousRate: number): number
```

**実装例**:
```typescript
export function calculateComparison(currentRate: number, previousRate: number): number {
  return Math.round((currentRate - previousRate) * 10) / 10;
}
```

---

### 5.3 calculateComparisons(sortedRecords)

ソート済みレコード配列に対して、全レコードの前回比を一括計算する。

```typescript
function calculateComparisons(sortedRecords: PracticeRecord[]): (number | null)[]
```

**実装例**:
```typescript
export function calculateComparisons(sortedRecords: PracticeRecord[]): (number | null)[] {
  return sortedRecords.map((record, index) => {
    if (index === sortedRecords.length - 1) return null;
    const previous = sortedRecords[index + 1];
    return calculateComparison(record.rate, previous.rate);
  });
}
```

**使用場面**: 記録一覧画面で各レコードの前回比を表示する際に使用。

---

## 6. ユーティリティ関数

### 6.1 getSortedRecords()

全記録をソート済みで取得する。

```typescript
function getSortedRecords(): PracticeRecord[]
```

**実装例**:
```typescript
export function getSortedRecords(): PracticeRecord[] {
  const records = getAllRecords();
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
```

---

### 6.2 getAverageRate()

全記録の平均正答率を計算する。

```typescript
function getAverageRate(): number
```

**実装例**:
```typescript
export function getAverageRate(): number {
  const records = getAllRecords();
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + r.rate, 0);
  return Math.round((sum / records.length) * 10) / 10;
}
```

---

### 6.3 getTotalCount()

総演習回数を取得する。

```typescript
function getTotalCount(): number
```

**実装例**:
```typescript
export function getTotalCount(): number {
  return getAllRecords().length;
}
```

---

### 6.4 clearAllData()

すべてのデータを削除する（デバッグ・リセット用）。

```typescript
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}
```

---

### 6.5 exportData() — MVP直後に実装

すべてのデータをJSON形式でエクスポートする。

```typescript
function exportData(): string
```

**実装例**:
```typescript
export function exportData(): string {
  return JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    records: getAllRecords(),
    settings: getSettings(),
  }, null, 2);
}
```

---

### 6.6 importData(jsonString) — MVP直後に実装

エクスポートしたデータをインポートする。

```typescript
function importData(jsonString: string): boolean
```

**実装例**:
```typescript
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (!data.version || !Array.isArray(data.records)) {
      throw new Error('Invalid data format');
    }

    const storageData: StorageData = {
      version: data.version,
      records: data.records,
    };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(storageData));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings ?? { examDate: null }));

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
```

---

## 7. 使用例(統合)

### 7.1 記録追加フロー(Home.tsx)

```typescript
import { createRecord, getLatestRecord } from '../services/storage';
import { calculateComparison } from '../services/calculator';

const handleSubmit = (formData: RecordInput) => {
  // 1. 保存前に前回の記録を取得
  const previousRecord = getLatestRecord();

  // 2. 記録を作成・保存
  const newRecord = createRecord(formData);

  if (!newRecord) {
    // エラー表示
    return;
  }

  // 3. 前回比を計算
  let comparison: number | null = null;
  if (previousRecord) {
    comparison = calculateComparison(newRecord.rate, previousRecord.rate);
  }

  // 4. UIに反映
  setComparison(comparison);
  showToast('記録を追加しました');
  resetForm();
};
```

**重要**: `createRecord()`で保存した後に`getLatestRecord()`を呼ぶと、今追加したレコード自身が返されるため、**必ず保存前に前回の記録を取得する**。

### 7.2 記録一覧表示フロー(RecordList.tsx)

```typescript
import { getSortedRecords, getAverageRate, getTotalCount } from '../services/storage';
import { calculateComparisons } from '../services/calculator';

function RecordList() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [comparisons, setComparisons] = useState<(number | null)[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const sorted = getSortedRecords();
    setRecords(sorted);
    setComparisons(calculateComparisons(sorted));
    setStats({ average: getAverageRate(), total: getTotalCount() });
  }, []);

  // ...
}
```

### 7.3 記録削除フロー(RecordList.tsx)

```typescript
import { deleteRecord, getSortedRecords, getAverageRate, getTotalCount } from '../services/storage';
import { calculateComparisons } from '../services/calculator';

const handleDelete = (id: string) => {
  const success = deleteRecord(id);
  if (!success) return;

  // 一覧と統計を再取得
  const sorted = getSortedRecords();
  setRecords(sorted);
  setComparisons(calculateComparisons(sorted));
  setStats({ average: getAverageRate(), total: getTotalCount() });
  showToast('記録を削除しました');
};
```

---

## 8. テストケース(参考)

### 8.1 createRecord()のテスト

```typescript
import { createRecord, getAllRecords, clearAllData } from '../services/storage';

beforeEach(() => {
  clearAllData();
});

test('正常に記録を作成できる', () => {
  const record = createRecord({
    date: '2026-02-15',
    total: 50,
    correct: 42,
  });

  expect(record).not.toBeNull();
  expect(record!.rate).toBe(84.0);
  expect(record!.id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  );
});

test('正答率が正しく計算される', () => {
  const record = createRecord({
    date: '2026-02-15',
    total: 80,
    correct: 68,
  });

  expect(record!.rate).toBe(85.0);
});
```

### 8.2 deleteRecord()のテスト

```typescript
test('記録を削除できる', () => {
  const record = createRecord({
    date: '2026-02-15',
    total: 50,
    correct: 42,
  });

  const result = deleteRecord(record!.id);
  expect(result).toBe(true);
  expect(getAllRecords().length).toBe(0);
});

test('存在しないIDの削除はfalseを返す', () => {
  const result = deleteRecord('non-existent-id');
  expect(result).toBe(false);
});
```

### 8.3 calculateComparisons()のテスト

```typescript
import { calculateComparisons } from '../services/calculator';

test('前回比が正しく計算される', () => {
  const records: PracticeRecord[] = [
    { id: '1', date: '2026-02-16', total: 80, correct: 68, rate: 85.0, createdAt: '2026-02-16T09:00:00.000Z' },
    { id: '2', date: '2026-02-15', total: 50, correct: 42, rate: 84.0, createdAt: '2026-02-15T10:00:00.000Z' },
    { id: '3', date: '2026-02-14', total: 50, correct: 38, rate: 76.0, createdAt: '2026-02-14T14:00:00.000Z' },
  ];

  const comparisons = calculateComparisons(records);
  expect(comparisons).toEqual([1.0, 8.0, null]);
});
```

---

## 付録: 完全なファイル構成

### src/services/storage.ts
```typescript
import type { PracticeRecord, RecordInput, Settings } from '../types';
import { calculateRate } from './calculator';

const STORAGE_KEYS = { RECORDS: 'past_exam_records', SETTINGS: 'past_exam_settings' } as const;
interface StorageData { version: string; records: PracticeRecord[]; }

// Record操作(MVP)
export function getAllRecords(): PracticeRecord[] { /* ... */ }
export function createRecord(input: RecordInput): PracticeRecord | null { /* ... */ }
export function getLatestRecord(): PracticeRecord | null { /* ... */ }
export function deleteRecord(id: string): boolean { /* ... */ }
export function getSortedRecords(): PracticeRecord[] { /* ... */ }

// Settings操作(MVP)
export function getSettings(): Settings { /* ... */ }
export function updateSettings(newSettings: Partial<Settings>): Settings | null { /* ... */ }

// ユーティリティ
export function clearAllData(): void { /* ... */ }
export function getAverageRate(): number { /* ... */ }
export function getTotalCount(): number { /* ... */ }

// エクスポート/インポート(MVP直後)
export function exportData(): string { /* ... */ }
export function importData(jsonString: string): boolean { /* ... */ }

// 将来
export function getRecordById(id: string): PracticeRecord | null { /* ... */ }
export function updateRecord(id: string, updates: Partial<RecordInput>): PracticeRecord | null { /* ... */ }
```

### src/services/calculator.ts
```typescript
import type { PracticeRecord } from '../types';

export function calculateRate(correct: number, total: number): number { /* ... */ }
export function calculateComparison(currentRate: number, previousRate: number): number { /* ... */ }
export function calculateComparisons(sortedRecords: PracticeRecord[]): (number | null)[] { /* ... */ }
```
