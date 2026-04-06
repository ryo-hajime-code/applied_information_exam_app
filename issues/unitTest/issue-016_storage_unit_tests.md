# Issue-016: storage.tsのユニットテスト実装

## 概要
`src/services/storage.ts` のLocalStorage操作関数に対するユニットテストを Vitest で実装する。
jsdom環境でLocalStorageをモックし、CRUD操作の正確性を検証する。

## タスク
- [ ] `src/services/storage.test.ts` を作成する
- [ ] 各テスト前に `clearAllData()` でLocalStorageをリセットする（`beforeEach`）
- [ ] `createRecord()` のテストケースを実装する
  - 設計書（05_api-design.md）セクション8.1のテストケースを実装
  - 正答率が正しく計算されること
  - ID がUUID v4形式であること
  - 戻り値に必要なプロパティが存在すること（`id`, `date`, `total`, `correct`, `rate`, `createdAt`）
  <!-- ※メモ：TypeScriptの型はランタイムでは消えるので、戻り値が `PracticeRecord` 型であるかの検証は不可 -->
- [ ] `getAllRecords()` のテストケースを実装する
  - 初期状態: `[]` を返す
  - 追加後: 追加した記録を返す
  - LocalStorageが空の場合: `[]` を返す
- [ ] `getLatestRecord()` のテストケースを実装する
  - 複数件の場合、最新の記録を返す
  - 0件の場合: `null` を返す
- [ ] `deleteRecord()` のテストケースを実装する
  - 設計書（05_api-design.md）セクション8.2のテストケースを実装
  - 存在しないIDの場合: `false` を返す
  - 削除後に記録が減っていること
- [ ] `getSortedRecords()` のテストケースを実装する
  - 日付降順に並んでいること
  - 元の配列が破壊されていないこと

## 完了条件
- `npm test` で全テストケースがパスする
- `createRecord`, `deleteRecord`, `getAllRecords`, `getLatestRecord`, `getSortedRecords` がカバーされている

## 依存関係
- 依存するIssue: Issue-002
- このIssueに依存するIssue: なし

## 備考
- Vitestのjsdom環境ではLocalStorageがデフォルトで利用可能
- `crypto.randomUUID()` はjsdom環境でも動作する（Node.js 19以上）、動作しない場合はモックを追加