# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

応用情報技術者試験の午前問題演習結果を記録・管理するWebアプリ（**過去問記録アプリ**）。
バックエンドなし、LocalStorage のみでデータ永続化するシングルページアプリケーション。

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run lint      # ESLint 実行
npm run test      # Vitest でユニットテスト実行（全件）
npm run test -- --run src/services/calculator.test.ts  # 特定ファイルのみ実行
```

## 技術スタック

- **フレームワーク**: React 18 + Vite
- **言語**: TypeScript（`strict: true` 必須）
- **ルーティング**: React Router v6
- **スタイル**: CSS Modules / Tailwind CSS
- **テスト**: Vitest
- **データ永続化**: LocalStorage のみ（バックエンドなし）

## アーキテクチャ

3層構造：UI層 → データアクセス層 → ストレージ層

```
src/
├── components/     # ページに依存しない再利用可能なUIパーツ
├── pages/          # ルーティングと1:1対応するページコンポーネント
├── services/
│   ├── storage.ts  # LocalStorage 操作（CRUD）
│   └── calculator.ts  # 正答率・前回比の計算（純粋関数）
├── utils/
│   ├── dateFormat.ts
│   └── validation.ts
└── types/index.ts  # すべての型定義を一元管理
```

**コンポーネントツリー**:
```
App → Router
  ├── Home (/)
  │   ├── CountDown（タップで受験日設定）
  │   ├── RecordForm（日付・問題数・正答数の入力）
  │   ├── ComparisonDisplay（前回比表示）
  │   └── NavigationButton（記録一覧へ）
  └── RecordList (/records)
      ├── RecordSummary（平均正答率・総演習回数）
      ├── RecordCard[]（削除ボタン付き）
      └── ConfirmDialog（削除確認）
```

**状態管理**: `useState` のみ（グローバル状態管理ライブラリは使用しない）

## データ層の重要ルール

**LocalStorage キー**:
- `past_exam_records` — `{ version: "1.0.0", records: PracticeRecord[] }` 形式（バージョンフィールド必須）
- `past_exam_settings` — `{ examDate: string | null }`

**主要データ型** (`src/types/index.ts`):
- `PracticeRecord` — 演習記録（`Record` という名前は TypeScript 標準の `Record<K,V>` と衝突するため使用禁止）
- `RecordInput` — ユーザー入力値（`id`/`rate`/`createdAt` は含まない）
- `StorageData` — LocalStorage 保存形式（`version` + `records` の構造）

**正答率計算**: `Math.round((correct / total) * 1000) / 10`（小数第1位まで）

**ソート順**: 日付降順、同日は `createdAt` 降順

**前回比の取得順序（重要）**: `createRecord()` で保存した後に `getLatestRecord()` を呼ぶと新しい記録自身が返るため、**必ず保存前に前回記録を取得する**。

**破壊的 sort 禁止**: `[...records].sort()` を使い元の配列を変更しない。

**ID 生成**: `crypto.randomUUID()` を使用（`Date.now()` ベースは衝突リスクがあるため使用禁止）

## テスト対象

計算ロジックを優先してテスト:
- `src/services/calculator.ts` — `calculateRate`, `calculateComparison`, `calculateComparisons`
- `src/services/storage.ts` — CRUD 操作（各テストの `beforeEach` で `clearAllData()` を呼ぶ）
- `src/utils/validation.ts` — 入力バリデーション

## 実装フェーズ（Issues）

`issues/` ディレクトリに実装仕様が Issue 単位で記載されている。依存関係は `issues/issue-summary.md` 参照。

- Phase 1 (#001-004): 型定義・データ層
- Phase 2 (#005-008): 共通UIコンポーネント
- Phase 3 (#009-014): ページ実装
- Phase 4 (#015-017): ユニットテスト
- Phase 5 (#018-020): 品質・デプロイ
- Phase 6 (#021): エクスポート・インポート機能（データ消失対策として MVP 直後に優先実装）

## 設計書

詳細仕様は `docs/` を参照:
- `02_architecture.md` — システム構成・技術選定理由
- `03_database.md` — LocalStorage スキーマ・バリデーションルール・マイグレーション方針
- `05_api-design.md` — storage.ts / calculator.ts の関数仕様と実装例
- `06_typescript-types.md` — 全型定義の完全版
