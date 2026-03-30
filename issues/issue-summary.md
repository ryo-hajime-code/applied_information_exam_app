# Issue サマリー

## フェーズ構成

- **Phase 1: 型定義・データ層実装** - TypeScript型定義・LocalStorageサービス・計算・バリデーション / issue #001-004
- **Phase 2: 共通UIコンポーネント実装** - 再利用可能なUIパーツ（Button, NumberInput, Toast, ConfirmDialog, RecordCard）/ issue #005-008
- **Phase 3: ページ・画面実装** - App/ルーティング・各コンポーネント・Home画面・RecordList画面 / issue #009-014
- **Phase 4: テスト実装** - calculator / storage / validation の各ユニットテスト / issue #015-017
- **Phase 5: 品質・デプロイ準備** - アクセシビリティ・アニメーション・README・デプロイ / issue #018-020
- **Phase 6: MVP後機能** - エクスポート・インポート機能（データ消失対策）/ issue #021

---

## Issue一覧

| No | ファイルパス | タイトル | 依存関係 |
|----|------------|---------|---------|
| 001 | features/issue-001_typescript_types.md | TypeScript型定義の実装 | なし |
| 002 | features/issue-002_storage_service.md | LocalStorageサービスの実装（storage.ts） | Issue-001, Issue-003 |
| 003 | features/issue-003_calculator_service.md | 計算サービスの実装（calculator.ts） | Issue-001 |
| 004 | features/issue-004_validation_and_utils.md | バリデーション・ユーティリティ関数の実装 | Issue-001 |
| 005 | features/issue-005_button_and_number_input_components.md | Button・NumberInputコンポーネントの実装 | Issue-001 |
| 006 | features/issue-006_toast_component.md | Toastコンポーネントの実装 | Issue-001 |
| 007 | features/issue-007_confirm_dialog_component.md | ConfirmDialogコンポーネントの実装 | Issue-001, Issue-005 |
| 008 | features/issue-008_record_card_component.md | RecordCardコンポーネントの実装 | Issue-001 |
| 009 | features/issue-009_app_routing_styles.md | App.tsx・ルーティング・グローバルスタイルの設定 | Issue-001 |
| 010 | features/issue-010_countdown_component.md | CountDownコンポーネントの実装 | Issue-001, Issue-002, Issue-004, Issue-005 |
| 011 | features/issue-011_record_form_component.md | RecordFormコンポーネントの実装 | Issue-001, Issue-003, Issue-004, Issue-005 |
| 012 | features/issue-012_comparison_display_component.md | ComparisonDisplayコンポーネントの実装 | Issue-001 |
| 013 | features/issue-013_home_page.md | Home画面の実装 | Issue-002, Issue-003, Issue-006, Issue-009, Issue-010, Issue-011, Issue-012 |
| 014 | features/issue-014_record_list_page.md | RecordList画面の実装 | Issue-002, Issue-003, Issue-006, Issue-007, Issue-008, Issue-009 |
| 015 | tests/issue-015_calculator_unit_tests.md | calculator.tsのユニットテスト実装 | Issue-003 |
| 016 | tests/issue-016_storage_unit_tests.md | storage.tsのユニットテスト実装 | Issue-002 |
| 017 | tests/issue-017_validation_unit_tests.md | validation.tsのユニットテスト実装 | Issue-004 |
| 018 | chore/issue-018_accessibility_and_animations.md | アクセシビリティ・アニメーション・レスポンシブ対応 | Issue-013, Issue-014 |
| 019 | chore/issue-019_readme_documentation.md | README・ドキュメント整備 | なし |
| 020 | chore/issue-020_deploy_setup.md | デプロイ設定（Vercel / Netlify） | Issue-013, Issue-014, Issue-019 |
| 021 | chore/issue-021_export_import_feature.md | エクスポート・インポート機能の実装 | Issue-002, Issue-007, Issue-013, Issue-014 |

---

## 実装順序

依存関係に基づく推奨実装順序を以下に示す。

### ステップ1 (Phase 1): 型定義・データ層
Issue-001 完了後に **003・004** を並行開始可能。Issue-003 完了後に **002** に進む。
```
001 完了 → 003 → 002
        └→ 004
```

### ステップ2 (Phase 2): 共通UIコンポーネント
Issue-001 完了後に **005・006・008** を並行して実装可能。Issue-005 完了後に **007** に進む。
```
001 完了 → 005 → 007
        └→ 006
        └→ 008
```

### ステップ3 (Phase 3): ページ・画面実装
**009・012** は Issue-001 完了後に早期着手可能。**010・011** は各種サービス・コンポーネントが揃ってから。
**013・014** は全コンポーネントが揃ってから着手する。
```
009 (001後に着手可)
012 (001後に着手可)
010 (001,002,004,005 完了後)
011 (001,003,004,005 完了後)
    ↓ 全完了後
013 (002,003,006,009,010,011,012 完了後)
014 (002,003,006,007,008,009 完了後)
```

### ステップ4 (Phase 4): テスト実装
**015・016・017** は Phase 1 の各サービス完了後に並行実施可能。Phase 3 と並行して進められる。
```
003完了 → 015
002完了 → 016
004完了 → 017
```

### ステップ5 (Phase 5): 品質・デプロイ準備
**018** は 013・014 完了後、**019** はいつでも可（Phase 3 と並行可）、**020** は 013・014・019 完了後。

### ステップ6 (Phase 6): MVP後機能
**021** は MVPリリース後、優先度高でバックログ先頭に置く。

---

## 備考

- **Issue-001 はすべての起点**であり、最優先で完了させること
- **Phase 1（データ層）と Phase 2（UIコンポーネント）は並行作業が可能**。2人以上での開発時に有効
- **テスト（Phase 4）はデータ層実装直後から並行して進められる**。TDDアプローチも可
- **Issue-021（エクスポート・インポート）はMVP直後に着手推奨**（LocalStorageはブラウザデータクリアで消失するため、データ保護の観点から重要）
- 1 Issue あたりの作業量は **0.5〜1日** を想定している
