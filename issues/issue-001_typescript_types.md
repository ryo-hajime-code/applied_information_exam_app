# Issue-001: TypeScript型定義の実装

## 概要
`src/types/index.ts` に、プロジェクト全体で使用するTypeScriptの型定義を実装する。
型定義を一元管理することで、全コンポーネント・サービス間の型の一貫性を確保する。

## タスク
- [ ] `src/types/index.ts` を作成する
- [ ] データ型を実装する（`PracticeRecord`, `RecordInput`, `Settings`, `StorageData`）
- [ ] ユーティリティ型を実装する（`ValidationResult`, `RecordStats`）
- [ ] Union型・定数を実装する（`ComparisonStatus`, `SortOrder`, `STORAGE_KEYS`）
- [ ] ReactコンポーネントのProps型を実装する（`RecordFormProps`, `RecordCardProps`, `CountDownProps`, `ComparisonDisplayProps`, `ConfirmDialogProps`, `ToastProps`）
- [ ] 型ガード関数を実装する（`isPracticeRecord()`, `isRecordInput()`）
- [ ] ヘルパー関数を実装する（`getComparisonStatus()`）
- [ ] TypeScriptコンパイルエラーがないことを確認する（`npx tsc --noEmit`）

## 完了条件
- `src/types/index.ts` が存在し、設計書（06_typescript-types.md）に記載された全型が定義されている
- `npx tsc --noEmit` がエラーなく完了する

## 依存関係
- 依存するIssue: なし
- このIssueに依存するIssue: Issue-002, Issue-003, Issue-004, Issue-005, Issue-006, Issue-007, Issue-008, Issue-009, Issue-010, Issue-011, Issue-012, Issue-013, Issue-014

## 備考
- `PracticeRecord` はTypeScript標準の `Record<K,V>` と名前が衝突するため、必ず `PracticeRecord` という名前を使用すること
- `STORAGE_KEYS` は `as const` で定義し、型安全なキー管理を行う