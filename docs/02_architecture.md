# アーキテクチャ設計書

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026-02-14 | 初版作成 |
| 2.0.0 | 2026-02-25 | レビュー指摘反映: 技術選定の確定(React)、ディレクトリ構成の整理、削除機能のMVP追加対応 |
| 3.0.0 | 2026-03-16 | スタイリング方針を CSS Modules / Tailwind CSS から styled-components に変更 |
| 4.0.0 | 2026-04-25 | Claudeが書いた設計書をベースに、自分自身の手で書き換える |

---

## 1. システム構成図

Single Page Applicationで、全処理はブラウザ内で完結
バックエンド不要とし、ローカルストレージに保存する。

┌─────────────────────────────────────────┐
│       クライアント(ブラウザ)             │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    フロントエンド(React)             │ │
│  │                                     │ │
│  │  ・画面表示                          │ │
│  │  ・ユーザー入力処理                  │ │
│  │  ・計算処理(正答率・前回比)          │ │
│  └─────────────┬──────────────────────┘ │
│                │                          │
│  ┌─────────────▼──────────────────────┐ │
│  │   データアクセス層                   │ │
│  │   (LocalStorage操作)                │ │
│  └─────────────┬──────────────────────┘ │
│                │                          │
│  ┌─────────────▼──────────────────────┐ │
│  │   LocalStorage                       │ │
│  │   (ブラウザ内のデータ保存領域)       │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘

---

## 2. 技術スタック

### 2.1 フロントエンド

#### 確定: React + Vite + TypeScript
```json
{
  "framework": "React 18",
  "build_tool": "Vite",
  "language": "TypeScript (strict: true)",
  "styling": "styled-components",
  "routing": "React Router v6"
}
```

**選定理由**:
- React: コンポーネントベースの設計のため、再利用性や保守性に優れているため。過去に学習したことがあり、学習コストが比較的低かったため。
- Vite: 高速なビルドを実現でき、TypeScriptサポートが標準であるため。
- TypeScript: クラスやインターフェースなどの概念を活用し、データ構造を定義できるため。また、コード内の潜在的なエラーに気づけるため。
- LocalStorage: データベース、バックエンドなしでMVPを最速で動かすため。

### 2.2 データ保存
- **LocalStorage**: キーバリュー型のブラウザストレージ
- **容量制限**: 5MB〜10MB(ブラウザによる)
- **データ形式**: バージョン付きJSON文字列(詳細は03_database.mdを参照)

### 2.3 ホスティング
- **推奨**: Vercel
- **理由**: Githubと連携し、ビルドからデプロイまでを行えるため

### 2.4 開発ツール
```json
{
  "version_control": "Git + GitHub",
  "package_manager": "npm",
  "test": "Vitest"
}
```

---

## 3. ディレクトリ構成

```
past-exam-tracker/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/        # 再利用可能なUIコンポーネント
│   │   ├── Button.tsx
│   │   ├── ComparisonDisplay.tsx  # 前回比表示
│   │   ├── ConfirmDialog.tsx
│   │   ├── CountDown.tsx          # カウントダウン・受験日設定UI
│   │   ├── NumberInput.tsx
│   │   ├── RecordCard.tsx
│   │   ├── RecordForm.tsx         # 記録入力フォーム
│   │   └── Toast.tsx
│   │
│   ├── pages/             # ページコンポーネント
│   │   ├── Home.tsx
│   │   └── RecordList.tsx
│   │
│   ├── services/          # ビジネスロジック・データアクセス
│   │   ├── storage.ts     # LocalStorage操作
│   │   └── calculator.ts  # 正答率・前回比の計算
│   │
│   ├── utils/             # ユーティリティ関数
│   │   ├── dateFormat.ts
│   │   └── validation.ts
│   │
│   ├── types/             # 型定義
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 各ディレクトリの役割

| ディレクトリ | 目的 | ルール |
|------------|------|--------|
| `components/` | 再利用可能な小さなUIパーツ | 特定のページに依存しない |
| `pages/` | 各画面に対応するコンポーネント | ルーティングと1対1で対応 |
| `services/` | データ操作・ビジネスロジック | UIから分離、テストしやすい純粋関数 |
| `utils/` | 汎用的なヘルパー関数 | プロジェクト固有の知識を持たない |
| `types/` | 型定義 | 全型定義を一元管理 |

---

## 4. コンポーネント構成

### 4.1 コンポーネントツリー

```
App
├── Home (/)                          # 記録入力・前回比表示・受験日カウントダウン
│   ├── CountDown                     # 受験日カウントダウン・インライン受験日設定UI
│   ├── RecordForm                    # 日付・問題数・正答数の入力フォーム
│   ├── ComparisonDisplay             # 前回比表示（記録後にフェードイン）
│   └── Button                        # 記録一覧への遷移ボタン
└── RecordList (/records)             # 記録一覧・削除操作
    ├── RecordCard[]                  # 記録カード（削除ボタン付き）
    ├── ConfirmDialog                 # 削除確認ダイアログ
    └── Toast                         # 削除後のトースト通知
```

### 4.2 状態管理

#### MVP段階: ローカルステート(useState)
以下の項目をuseStateで状態管理する。
**Home.tsx**:
- examDate（受験予定日）
- comparison（前回比　今回の正答率 − 前回の正答率）
- toastMessage（トースト通知のメッセージ文字列）
- toastVisible（トースト通知の表示フラグ）

**RecordList.tsx**:
- records（一覧ページに表示する演習記録）
- comparisons（各記録の前回比。削除後に再計算される）
- stats（平均正答率・総演習回数のサマリー情報）
- deleteTargetId（削除確認ダイアログの対象レコードID。null = 未選択）
- isDialogOpen（削除確認ダイアログの表示フラグ）
- toastMessage（トースト通知のメッセージ文字列）
- toastVisible（トースト通知の表示フラグ）

---

## 5. データフロー

### 5.1 記録追加の流れ

```
[ユーザー入力]
     ↓
[RecordForm]
  - フォームの値をバリデーションチェックにかける
     ↓
[calculator.ts]
  - 正答率を計算
     ↓
[Home]
  - 保存前に getLatestRecord() で前回の記録を取得（前回比計算のため）
     ↓
[storage.ts]
  - LocalStorageに保存
     ↓
[calculator.ts]
  - 前回比を計算
     ↓
[Home]
  - 状態を更新
  - 前回比を表示
  - トースト通知
```

### 5.2 記録削除の流れ

```
[RecordCard 削除ボタン]
     ↓
[ConfirmDialog]
  - 「本当に削除しますか？」を表示
     ↓ (確認)
[storage.ts]
  - LocalStorageから削除
     ↓
[RecordList]
  - 状態を更新
  - 一覧を再描画
```

### 5.3 記録取得の流れ

```
[ページ読み込み]
     ↓
[RecordList / Home]
  - useEffect でデータ取得
     ↓
[storage.ts]
  - LocalStorageから取得
     ↓
[コンポーネント]
  - 状態にセット・画面に表示
```

---

## 6. 技術的制約・考慮事項

### 6.1 LocalStorageの制約
- **容量制限**: 5MB〜10MB(過去問記録なら十分)
- **同期API**: 大量データ操作時はブロッキングに注意
- **ドメイン単位**: 別ドメインからはアクセス不可
- **ユーザーが削除可能**: ブラウザのデータクリアで消える

### 6.2 対策
- 操作ごとにtry-catchでエラーハンドリング
- データにversionフィールドを初回から含める（将来のマイグレーション対応）

### 6.3 セキュリティ
- 個人情報なし: セキュリティリスク低
- XSS対策: Reactのデフォルト機能で対応済み
※ {value} として描画するならReactが自動でXSSを防いでくれる。
　一方、dangerouslySetInnerHTML や innerHTML の直書きが危険

---
