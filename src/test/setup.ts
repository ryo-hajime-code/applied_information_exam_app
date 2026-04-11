// src/test/setup.ts
// jest-dom のカスタムマッチャー（toBeInTheDocument, toHaveTextContent など）を
// 全テストファイルで使えるように登録する。
// vite.config.ts の test.setupFiles に指定することで自動的に読み込まれる。
import '@testing-library/jest-dom';

// 「jest-dom マッチャー」とは「画面に○○が表示されているか？」を確認するための検査ツール。
/*

jest-domなし
expect(element).not.toBe(null)  // 「nullじゃない」しか言えない

jest-domあり
expect(element).toBeInTheDocument()  // 「画面に表示されている」
expect(element).toHaveTextContent('記録を追加しました')  // 「このテキストが含まれている」
expect(button).toBeDisabled()  // 「ボタンが押せない状態になっている」

*/