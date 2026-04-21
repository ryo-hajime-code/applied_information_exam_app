# Issue-026: エクスポート・インポート機能の実装

## 概要
LocalStorageのデータをJSONファイルとしてエクスポート・インポートする機能を実装する。
データ消失リスクへの対策として、MVP直後に実装する優先度の高い機能。

## タスク
- [ ] `src/services/storage.ts` に `exportData()` を実装する（既存の骨格を埋める）
  - 全記録・設定をJSON文字列として返す
  - ファイル名: `past_exam_backup_YYYY-MM-DD.json`
  - Blob + URL.createObjectURL でファイルダウンロードを実装する
- [ ] `src/services/storage.ts` に `importData(jsonString)` を実装する
  - JSONを解析し、`version` と `records` の存在チェック
  - LocalStorage に上書き保存する
  - 失敗時は `false` を返す
- [ ] 設定画面またはRecordList画面に「エクスポート」ボタンを追加する（セカンダリボタン）
- [ ] 「インポート」ボタンを追加する（`<input type="file" accept=".json">`）
  - ファイル選択後に `FileReader` で読み込み、`importData()` を呼ぶ
  - 成功時にトースト通知「データをインポートしました」
  - 失敗時にエラー表示「インポートに失敗しました。ファイルを確認してください」
- [ ] インポート時に確認ダイアログを表示する（既存データが上書きされる旨を警告）

## 完了条件
- 「エクスポート」ボタンを押すと JSON ファイルがダウンロードされる
- ダウンロードした JSON ファイルをインポートすると記録・設定が復元される
- 不正なJSONをインポートしてもエラーハンドリングされ、アプリがクラッシュしない

## 依存関係
- 依存するIssue: Issue-002, Issue-007, Issue-013, Issue-014
- このIssueに依存するIssue: なし

## 備考
- 設計書（03_database.md）セクション11、設計書（05_api-design.md）セクション6.5, 6.6を参照
- インポートは既存データを上書きする（マージではない）ため、確認ダイアログが必須
- エクスポートファイルの形式は `{ version, exportedAt, records, settings }` とする