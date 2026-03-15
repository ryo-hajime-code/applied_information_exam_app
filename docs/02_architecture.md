# アーキテクチャ設計書

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026-02-14 | 初版作成 |
| 2.0.0 | 2026-02-25 | レビュー指摘反映: 技術選定の確定(React)、ディレクトリ構成の整理、削除機能のMVP追加対応 |
| 3.0.0 | 2026-03-16 | スタイリング方針を CSS Modules / Tailwind CSS から styled-components に変更 |

---

## 1. システム構成図

```
┌─────────────────────────────────────────┐
│          ユーザー(ブラウザ)              │
└────────────────┬────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼────────────────────────┐
│     Webホスティング(Vercel/Netlify)      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   静的ファイル(HTML/CSS/JS)         │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘

        ↓ ダウンロード後、ブラウザ内で実行

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
```

### 特徴
- **サーバーレス**: バックエンド不要、すべてクライアントで完結
- **シンプル**: 3層構造(UI層・データアクセス層・ストレージ層)
- **低コスト**: ホスティング無料枠で運用可能

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
- React: 学習リソースが豊富、コンポーネント再利用しやすい
- Vite: 高速なビルド、TypeScriptサポートが標準
- TypeScript: データ構造が明確、LocalStorage操作で型安全性が効く
- strict: true を初期から有効化し、型安全性を最大限に活用する

### 2.2 データ保存
- **LocalStorage**: キーバリュー型のブラウザストレージ
- **容量制限**: 5MB〜10MB(ブラウザによる)
- **データ形式**: バージョン付きJSON文字列(詳細は03_database.mdを参照)

### 2.3 ホスティング
- **推奨**: Vercel or Netlify
- **理由**: 無料枠が充実、GitHubと連携して自動デプロイ、HTTPS自動対応

### 2.4 開発ツール
```json
{
  "version_control": "Git + GitHub",
  "package_manager": "npm",
  "code_formatter": "Prettier",
  "linter": "ESLint",
  "test": "Vitest(計算ロジックのテストを優先)"
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
│   │   ├── NumberInput.tsx
│   │   ├── RecordCard.tsx
│   │   ├── ConfirmDialog.tsx
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
├── Router
    ├── Home (/)
    │   ├── CountDown          # 受験日カウントダウン(タップで受験日設定)
    │   ├── RecordForm         # 記録入力フォーム
    │   │   ├── DateInput
    │   │   ├── NumberInput
    │   │   └── Button
    │   ├── ComparisonDisplay  # 前回比表示
    │   └── NavigationButton   # 記録一覧へのボタン
    │
    └── RecordList (/records)
        ├── RecordSummary      # 平均正答率・総演習回数
        ├── RecordCard[]       # 各記録のカード(削除ボタン付き)
        ├── ConfirmDialog      # 削除確認ダイアログ
        └── BackButton
```

### 4.2 状態管理

#### MVP段階: ローカルステート(useState)
```tsx
// Home.tsx
const [records, setRecords] = useState<PracticeRecord[]>([]);
const [examDate, setExamDate] = useState<string | null>(null);
const [comparison, setComparison] = useState<number | null>(null);

// RecordList.tsx
const [records, setRecords] = useState<PracticeRecord[]>([]);
```

**理由**: シンプルで十分、状態管理ライブラリ不要

#### 拡張時の選択肢
- Context API: グローバル状態が必要になったら
- Zustand: より複雑な状態管理が必要になったら

---

## 5. データフロー

### 5.1 記録追加の流れ

```
[ユーザー入力]
     ↓
[RecordForm]
  - フォームの値を収集
  - バリデーション(validation.ts)
     ↓
[calculator.ts]
  - 正答率を計算
     ↓
[Home]
  - 保存前に getLatestRecord() で前回の記録を取得
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
  - useEffect で初期化
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
- エクスポート機能をMVP直後に実装（データ消失対策）
- データにversionフィールドを初回から含める（将来のマイグレーション対応）

### 6.3 セキュリティ
- 個人情報なし: セキュリティリスク低
- XSS対策: Reactのデフォルト機能で対応済み
- HTTPS: ホスティングサービスで自動対応

---

## 7. パフォーマンス考慮

### 7.1 最適化ポイント
- **初回ロード**: Viteのコード分割で高速化
- **レンダリング**: 不要な再レンダリングを避ける(React.memo等)
- **LocalStorage**: 読み書き頻度を最小限に

### 7.2 目標値
- 初回ロード: 3秒以内
- 記録追加: 0.5秒以内(体感でほぼ瞬時)
- 画面遷移: 0.2秒以内

---

## 8. 開発環境セットアップ

### 8.1 必要なツール
```bash
node -v  # v18以上推奨
npm -v
```

### 8.2 プロジェクト作成コマンド
```bash
npm create vite@latest past-exam-tracker -- --template react-ts
cd past-exam-tracker
npm install
npm install react-router-dom
npm install date-fns
npm install styled-components
npm install -D @types/styled-components
npm run dev
```

### 8.3 tsconfig.json の設定
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**注意**: strictモードは初期から有効化する。

---

## 9. デプロイ手順

### 9.1 GitHub連携(推奨)
1. GitHubリポジトリを作成
2. Vercel/NetlifyでGitHub連携
3. pushするだけで自動デプロイ

### 9.2 手動デプロイ(Vercel)
```bash
npm install -g vercel
vercel
```

---

## 10. 今後の拡張を見据えた設計

### 10.1 拡張しやすい設計
- **データアクセス層の抽象化**: `storage.ts`を差し替えるだけでFirebaseに移行可能
- **コンポーネントの疎結合**: ページ間で依存しない
- **データのバージョン管理**: 初回からversionフィールドを含め、マイグレーション対応可能

### 10.2 技術的負債の回避
- **ESLint/Prettier**: 最初から設定
- **TypeScript strict**: 最初から有効化
- **テストコード**: 計算ロジック(calculator.ts)から優先的に追加

---

## 付録: アーキテクチャ判断の記録

| 判断 | 理由 |
|------|------|
| サーバーレス | 運用コストゼロ、個人開発に最適 |
| React | コンポーネント指向で拡張しやすい、学習リソースが豊富 |
| LocalStorage | 最もシンプル、データ量が少ない、認証不要 |
| strict: true 初期有効化 | 後から有効化すると大量のエラー修正が必要になるため |
| 削除機能をMVPに含める | 入力ミスは必ず起きるため |
