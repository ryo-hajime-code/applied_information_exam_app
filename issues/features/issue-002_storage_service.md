# Issue-002: LocalStorageサービスの実装（storage.ts）

## 概要
`src/services/storage.ts` に、LocalStorageを操作するための全データアクセス関数を実装する。
UI層からデータ層を分離し、全CRUD操作とバージョン付きストレージ構造への対応を行う。

## タスク
- [ ] `src/services/storage.ts` を作成する
- [ ] `STORAGE_KEYS` 定数と `StorageData` インターフェースを定義する
- [ ] `getAllRecords()` を実装する（全記録をLocalStorageから取得）
- [ ] `createRecord(input)` を実装する（新規記録を追加）
- [ ] `getLatestRecord()` を実装する（最新記録を取得、破壊的sortを避ける）
- [ ] `deleteRecord(id)` を実装する（記録を削除、MVPスコープ）
- [ ] `getSortedRecords()` を実装する（日付降順・createdAt降順でソート済みの全記録を取得）
- [ ] `getSettings()` を実装する（設定を取得、未保存時はデフォルト値を返す）
- [ ] `updateSettings(newSettings)` を実装する（設定を更新）
- [ ] `getAverageRate()` を実装する（平均正答率を計算）
- [ ] `getTotalCount()` を実装する（総演習回数を取得）
- [ ] `clearAllData()` を実装する（デバッグ用全データ削除）
- [ ] 起動時マイグレーション処理を実装する（`version` フィールドがない旧データへの対応）
- [ ] 全関数に `try-catch` エラーハンドリングを実装する

## 完了条件
- `src/services/storage.ts` が存在し、設計書（05_api-design.md）のMVP機能がすべて実装されている
- バージョン付きストレージ構造（`{ version, records }`）でLocalStorageに保存・読み込みできる
- エラー時に `[]` または `null` を返し、例外が伝播しない
- `[...records].sort()` を使い、元の配列を破壊しないこと

## 依存関係
- 依存するIssue: Issue-001, Issue-003
- このIssueに依存するIssue: Issue-013, Issue-014, Issue-016

## 備考
- IDの生成には `crypto.randomUUID()` を使用する（`Date.now()` ベースは衝突リスクがあるため不可）
- `createRecord()` 内で `calculateRate()` を呼び出すため Issue-003 への依存がある
- `QuotaExceededError` など LocalStorage 固有の例外も `catch` で捕捉すること