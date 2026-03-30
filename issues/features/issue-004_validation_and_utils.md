# Issue-004: バリデーション・ユーティリティ関数の実装

## 概要
`src/utils/validation.ts` と `src/utils/dateFormat.ts` に、入力バリデーションと日付フォーマット関数を実装する。
ビジネスルールに基づくバリデーションをUI層から分離し、再利用可能な形で提供する。

## タスク
- [ ] `src/utils/validation.ts` を作成する
- [ ] `validateRecord(input)` を実装する（RecordInput のバリデーション、日付・total・correct のチェック）
- [ ] `validateSettings(settings)` を実装する（Settings のバリデーション、examDate の形式・将来日付チェック）
- [ ] `src/utils/dateFormat.ts` を作成する
- [ ] `formatDate(dateString)` を実装する（YYYY-MM-DD を日本語表示に変換）
- [ ] `calcDaysUntil(dateString)` を実装する（受験日までの残り日数を計算）
- [ ] `getTodayString()` を実装する（今日の日付を YYYY-MM-DD 形式で返す）

## 完了条件
- `src/utils/validation.ts` に `validateRecord()` と `validateSettings()` が実装されている
- `src/utils/dateFormat.ts` に日付関連の関数が実装されている
- バリデーションエラー時は `{ valid: false, error: 'エラーメッセージ' }` を返す
- 正常時は `{ valid: true }` を返す
- 各バリデーションルール（total: 1-200、correct: 0-total、日付形式）が設計書通りに実装されている

## 依存関係
- 依存するIssue: Issue-001
- このIssueに依存するIssue: Issue-011, Issue-013, Issue-017

## 備考
- バリデーションルールの詳細は `03_database.md` セクション7を参照
- `date-fns` を活用して日付計算を行う
- 受験日のバリデーションは「今日以降の日付」のみ許容する