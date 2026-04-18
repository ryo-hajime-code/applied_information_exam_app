# Issue サマリー

## フェーズ構成

- **Phase 1: 型定義・データ層実装** - TypeScript型定義・LocalStorageサービス・計算・バリデーション / issue #001-004
- **Phase 2: 共通UIコンポーネント実装** - 再利用可能なUIパーツ（Button, NumberInput, Toast, ConfirmDialog, RecordCard）/ issue #005-008
- **Phase 3: ページ・画面実装** - App/ルーティング・各コンポーネント・Home画面・RecordList画面 / issue #009-014
- **Phase 4: テスト実装** - calculator / storage / validation の各ユニットテスト / issue #015-017
- **Phase 5: 結合テスト・システムテスト** - サービス層・テスト環境構築・Home画面・RecordList画面の結合テスト、システムテスト / issue #018-022
- **Phase 6: 品質・デプロイ準備** - アクセシビリティ・アニメーション・README・デプロイ / issue #023-025
- **Phase 7: MVP後機能** - エクスポート・インポート機能（データ消失対策）/ issue #026

---

## Issue一覧

| No | ディレクトリ | ファイル名 | タイトル | 依存関係 |
|----|------------|----------|---------|---------|
| 001 | features | issue-001_typescript_types.md | TypeScript型定義の実装 | なし |
| 002 | features | issue-002_storage_service.md | LocalStorageサービスの実装（storage.ts） | Issue-001, Issue-003 |
| 003 | features | issue-003_calculator_service.md | 計算サービスの実装（calculator.ts） | Issue-001 |
| 004 | features | issue-004_validation_and_utils.md | バリデーション・ユーティリティ関数の実装 | Issue-001 |
| 005 | features | issue-005_button_and_number_input_components.md | Button・NumberInputコンポーネントの実装 | Issue-001 |
| 006 | features | issue-006_toast_component.md | Toastコンポーネントの実装 | Issue-001 |
| 007 | features | issue-007_confirm_dialog_component.md | ConfirmDialogコンポーネントの実装 | Issue-001, Issue-005 |
| 008 | features | issue-008_record_card_component.md | RecordCardコンポーネントの実装 | Issue-001 |
| 009 | features | issue-009_app_routing_styles.md | App.tsx・ルーティング・グローバルスタイルの設定 | Issue-001 |
| 010 | features | issue-010_countdown_component.md | CountDownコンポーネントの実装 | Issue-001, Issue-002, Issue-004, Issue-005 |
| 011 | features | issue-011_record_form_component.md | RecordFormコンポーネントの実装 | Issue-001, Issue-003, Issue-004, Issue-005 |
| 012 | features | issue-012_comparison_display_component.md | ComparisonDisplayコンポーネントの実装 | Issue-001 |
| 013 | features | issue-013_home_page.md | Home画面の実装 | Issue-002, Issue-003, Issue-006, Issue-009, Issue-010, Issue-011, Issue-012 |
| 014 | features | issue-014_record_list_page.md | RecordList画面の実装 | Issue-002, Issue-003, Issue-006, Issue-007, Issue-008, Issue-009 |
| 015 | unitTest | issue-015_calculator_unit_tests.md | calculator.tsのユニットテスト実装 | Issue-003 |
| 016 | unitTest | issue-016_storage_unit_tests.md | storage.tsのユニットテスト実装 | Issue-002 |
| 017 | unitTest | issue-017_validation_unit_tests.md | validation.tsのユニットテスト実装 | Issue-004 |
| 018 | integrationTest | issue-018_integration_tests_service.md | 結合テスト — サービス層データフロー | Issue-002, Issue-003, Issue-004 |
| 019 | integrationTest | issue-019_integration_tests_setup.md | 結合テスト — テスト環境構築 | Issue-013, Issue-014 |
| 020 | integrationTest | issue-020_integration_tests_home.md | 結合テスト — Home画面 | Issue-013, Issue-019 |
| 021 | integrationTest | issue-021_integration_tests_record_list.md | 結合テスト — RecordList画面 | Issue-014, Issue-019 |
| 022 | systemTest | issue-022_system_test.md | システムテスト | Issue-019, Issue-020, Issue-021 |
| 023 | chore | issue-023_accessibility_and_animations.md | アクセシビリティ・アニメーション・レスポンシブ対応 | Issue-013, Issue-014 |
| 024 | chore | issue-024_readme_documentation.md | README・ドキュメント整備 | なし |
| 025 | chore | issue-025_deploy_setup.md | デプロイ設定（Vercel / Netlify） | Issue-013, Issue-014, Issue-024 |
| 026 | chore | issue-026_export_import_feature.md | エクスポート・インポート機能の実装 | Issue-002, Issue-007, Issue-013, Issue-014 |

---

## 備考

- **Issue-001 はすべての起点**であり、最優先で完了させること
- **Phase 1（データ層）と Phase 2（UIコンポーネント）は並行作業が可能**。2人以上での開発時に有効
- 1 Issue あたりの作業量は **0.5〜1日** を想定している
