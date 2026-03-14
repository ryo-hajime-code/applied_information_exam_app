# データベース設計書

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026-02-14 | 初版作成 |
| 2.0.0 | 2026-02-25 | レビュー指摘反映: Record→PracticeRecord改名、versionフィールド初回導入、ID生成をcrypto.randomUUID()に変更、totalの上限値追加、削除機能をMVP化、エクスポート機能の優先度引き上げ |

---

## 1. データモデル概要

### 1.1 エンティティ一覧

```
┌──────────────────┐
│  PracticeRecord  │  過去問演習の記録
│──────────────────│
│ id               │
│ date             │
│ total            │
│ correct          │
│ rate             │
│ createdAt        │
└──────────────────┘

┌──────────────────┐
│    Settings      │  アプリ設定
│──────────────────│
│ examDate         │
└──────────────────┘
```

### 1.2 リレーション
- エンティティ間のリレーションなし(独立した2つのデータ群)

---

## 2. LocalStorageのキー設計

### 2.1 キー一覧

| キー | データ型 | 説明 |
|------|---------|------|
| `past_exam_records` | バージョン付きJSONオブジェクト | 過去問記録(version + records配列) |
| `past_exam_settings` | JSONオブジェクト | アプリ設定 |

### 2.2 キー命名規則
- プレフィックス: `past_exam_`(他のアプリとの衝突回避)

---

## 3. データ定義

### 3.1 PracticeRecord(過去問記録)

#### ストレージ構造（バージョン付き）

```json
{
  "version": "1.0.0",
  "records": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "date": "2026-02-15",
      "total": 50,
      "correct": 42,
      "rate": 84.0,
      "createdAt": "2026-02-15T10:30:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "date": "2026-02-14",
      "total": 50,
      "correct": 38,
      "rate": 76.0,
      "createdAt": "2026-02-14T14:20:00.000Z"
    }
  ]
}
```

**重要**: `version`フィールドは初回保存時から必ず含める。将来のデータ構造変更時にマイグレーションを行うために必要。

#### フィールド定義

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|------|------|---------------|
| `id` | string | ✅ | 一意の識別子 | UUID v4形式 |
| `date` | string | ✅ | 実施日 | YYYY-MM-DD形式 |
| `total` | number | ✅ | 解いた問題数 | 1以上200以下の整数 |
| `correct` | number | ✅ | 正答した問題数 | 0以上、total以下の整数 |
| `rate` | number | ✅ | 正答率(%) | 0〜100の小数(小数点第1位まで) |
| `createdAt` | string | ✅ | 記録作成日時 | ISO 8601形式 |

#### 計算項目
```typescript
// 正答率の計算式
rate = Math.round((correct / total) * 1000) / 10;
// 例: Math.round((42 / 50) * 1000) / 10 = 84.0
```

#### ID生成ルール
```typescript
// UUID v4を使用（衝突リスクなし）
const generateId = (): string => crypto.randomUUID();
// 例: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**旧方式（v1.0.0で使用していた `rec_${Date.now()}` 方式）からの変更理由**: 高速で連続記録した場合にミリ秒が衝突する可能性があったため。

---

### 3.2 Settings(アプリ設定)

#### データ構造
```json
{
  "examDate": "2026-04-20"
}
```

#### フィールド定義

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|------|------|---------------|
| `examDate` | string \| null | ❌ | 受験予定日 | YYYY-MM-DD形式、未設定の場合はnull |

#### デフォルト値
```json
{
  "examDate": null
}
```

---

## 4. データ操作仕様

### 4.1 CRUD操作一覧

| 操作 | 対象 | 関数名 | MVP | 説明 |
|------|------|--------|-----|------|
| Create | PracticeRecord | `createRecord()` | ✅ | 新規記録を追加 |
| Read | PracticeRecord | `getAllRecords()` | ✅ | 全記録を取得 |
| Read | PracticeRecord | `getLatestRecord()` | ✅ | 最新の記録を取得 |
| Delete | PracticeRecord | `deleteRecord()` | ✅ | 記録を削除 |
| Read | PracticeRecord | `getRecordById()` | - | 特定の記録を取得(将来) |
| Update | PracticeRecord | `updateRecord()` | - | 記録を更新(将来) |
| Read | Settings | `getSettings()` | ✅ | 設定を取得 |
| Update | Settings | `updateSettings()` | ✅ | 設定を更新 |

### 4.2 データ取得の並び順

```typescript
// 記録一覧: 日付の新しい順(降順)
// 同日の場合はcreatedAtの新しい順
const sorted = [...records].sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

**注意**: `[...records].sort()` を使い、元の配列を破壊しないこと。

---

## 5. 記録一覧の前回比計算仕様

記録一覧画面で各レコードに表示する「前回比」の計算方法を以下に定義する。

### 5.1 計算ルール

1. 全レコードを日付降順（同日はcreatedAt降順）でソートする
2. 各レコードの「前回」は、ソート順で1つ後ろのレコードとする
3. ソート順で最後のレコード（最も古い記録）は前回比なし（`null`）

### 5.2 実装例

```typescript
// ソート済みrecordsに対して前回比を計算
const comparisons: (number | null)[] = sortedRecords.map((record, index) => {
  if (index === sortedRecords.length - 1) return null; // 最も古い記録
  const previousRecord = sortedRecords[index + 1];
  return Math.round((record.rate - previousRecord.rate) * 10) / 10;
});
```

### 5.3 同日に複数記録した場合

同日に複数記録した場合、`createdAt`の順序で前後関係を判定する。例:

| 記録 | date | createdAt | rate | 前回比 |
|------|------|-----------|------|--------|
| A | 2026-02-15 | 15:00 | 85.0% | +1.0% (B比) |
| B | 2026-02-15 | 10:00 | 84.0% | +8.0% (C比) |
| C | 2026-02-14 | 14:00 | 76.0% | -- |

---

## 6. サンプルデータ

### 6.1 初期データ(空)

```typescript
localStorage.setItem('past_exam_records', JSON.stringify({
  version: '1.0.0',
  records: []
}));
localStorage.setItem('past_exam_settings', JSON.stringify({ examDate: null }));
```

### 6.2 テストデータ

```json
{
  "version": "1.0.0",
  "records": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "date": "2026-02-16",
      "total": 80,
      "correct": 68,
      "rate": 85.0,
      "createdAt": "2026-02-16T09:00:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "date": "2026-02-15",
      "total": 50,
      "correct": 42,
      "rate": 84.0,
      "createdAt": "2026-02-15T10:30:00.000Z"
    },
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "date": "2026-02-14",
      "total": 50,
      "correct": 38,
      "rate": 76.0,
      "createdAt": "2026-02-14T14:20:00.000Z"
    }
  ]
}
```

---

## 7. バリデーションルール

### 7.1 PracticeRecord作成時のチェック

```typescript
const validateRecord = (input: RecordInput): ValidationResult => {
  if (!input.date) {
    return { valid: false, error: '実施日を入力してください' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' };
  }

  if (!Number.isInteger(input.total) || input.total < 1) {
    return { valid: false, error: '解いた問題数は1以上にしてください' };
  }

  if (input.total > 200) {
    return { valid: false, error: '解いた問題数は200以下にしてください' };
  }

  if (!Number.isInteger(input.correct) || input.correct < 0) {
    return { valid: false, error: '正答数は0以上にしてください' };
  }

  if (input.correct > input.total) {
    return { valid: false, error: '正答数が解いた問題数を超えています' };
  }

  return { valid: true };
};
```

### 7.2 Settings更新時のチェック

```typescript
const validateSettings = (settings: Partial<Settings>): ValidationResult => {
  if (settings.examDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(settings.examDate)) {
      return { valid: false, error: '日付はYYYY-MM-DD形式で入力してください' };
    }

    const examDate = new Date(settings.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (examDate < today) {
      return { valid: false, error: '受験日は今日以降の日付にしてください' };
    }
  }

  return { valid: true };
};
```

---

## 8. データ容量見積もり

### 8.1 1レコードのサイズ
約170バイト(UUIDがタイムスタンプIDより少し長い)

### 8.2 想定データ量
- 1日1回記録 × 365日 = 365レコード
- 365 × 170バイト + バージョン情報 ≈ 63KB
- LocalStorage容量(5MB)に対して: **約1%**

**結論**: 容量は十分、数年分のデータでも問題なし

---

## 9. データマイグレーション

### 9.1 バージョン管理

LocalStorageの`past_exam_records`は初回から以下の形式で保存する:

```json
{
  "version": "1.0.0",
  "records": [ /* ... */ ]
}
```

### 9.2 起動時のマイグレーション処理

アプリ起動時に`version`フィールドをチェックし、必要に応じてマイグレーションを実行する:

```typescript
const loadRecordsWithMigration = (): PracticeRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return [];

    const data = JSON.parse(raw);

    // versionフィールドがない場合（v1以前の旧データ）
    if (Array.isArray(data)) {
      const migrated = { version: '1.0.0', records: data };
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(migrated));
      return data;
    }

    // バージョンに応じたマイグレーション（将来用）
    // if (data.version === '1.0.0') { data = migrateV1toV2(data); }

    return data.records;
  } catch (e) {
    console.error('データの読み込みに失敗しました:', e);
    return [];
  }
};
```

### 9.3 マイグレーション例（将来）

#### v1.0.0 → v2.0.0（単元フィールドを追加）
```typescript
const migrateV1toV2 = (oldData: StorageData): StorageData => {
  return {
    version: '2.0.0',
    records: oldData.records.map(record => ({
      ...record,
      category: null
    }))
  };
};
```

---

## 10. エラーハンドリング

### 10.1 LocalStorage操作時の例外

```typescript
// QuotaExceededError
try {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));
} catch (e) {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    // UIにエラーメッセージを表示
  }
}
```

### 10.2 データ破損時の対処

```typescript
const loadRecords = (): PracticeRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.records ?? [];
  } catch (e) {
    console.error('データの読み込みに失敗しました:', e);
    // 破損データをバックアップキーに退避
    const corrupted = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (corrupted) {
      localStorage.setItem('past_exam_records_backup', corrupted);
    }
    return [];
  }
};
```

---

## 11. エクスポート・インポート機能

**優先度: MVP直後に実装（データ消失対策として重要）**

### 11.1 エクスポート

```typescript
const exportData = (): void => {
  const records = localStorage.getItem(STORAGE_KEYS.RECORDS);
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    records: JSON.parse(records || '{"version":"1.0.0","records":[]}').records,
    settings: JSON.parse(settings || '{}')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `past_exam_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### 11.2 インポート

```typescript
const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.version || !Array.isArray(data.records)) {
      throw new Error('Invalid data format');
    }

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify({
      version: data.version,
      records: data.records
    }));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings || { examDate: null }));

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
```

---

## 12. テストデータ生成スクリプト

```typescript
const generateTestData = (days = 30): PracticeRecord[] => {
  const records: PracticeRecord[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const total = Math.floor(Math.random() * 31) + 50; // 50-80問
    const correct = Math.floor(total * (0.6 + Math.random() * 0.3)); // 60-90%
    const rate = Math.round((correct / total) * 1000) / 10;

    records.push({
      id: crypto.randomUUID(),
      date: date.toISOString().split('T')[0],
      total,
      correct,
      rate,
      createdAt: date.toISOString()
    });
  }

  return records;
};
```

---

## 付録: よくある質問

| 質問 | 回答 |
|------|------|
| なぜUUIDを使うのか? | `Date.now()`ベースだと高速連続記録で衝突する可能性があるため |
| なぜ配列で保存するのか? | LocalStorageはキーバリューストアなので、複数レコードは配列でまとめる必要がある |
| dateとcreatedAtの両方を持つ理由は? | `date`はユーザーが指定する実施日、`createdAt`はシステムが記録する作成日時。別の日にまとめて記録するケースに対応 |
| 正答率を保存する必要はある? | 計算で求められるが、表示の一貫性のため保存する。更新時は必ず再計算すること |
| totalの上限200の根拠は? | 応用情報の午前試験は80問。余裕を持たせつつ、誤入力を防ぐための上限値 |
| なぜ初回からversionを入れるのか? | 後から追加すると、versionありなしのデータが混在して面倒になるため |
