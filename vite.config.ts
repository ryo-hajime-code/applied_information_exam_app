import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jest-dom のカスタムマッチャーを全テストで使えるようにする
    setupFiles: ['src/test/setup.ts'],
    // React コンポーネントのレンダリングに jsdom が必要なためグローバルに設定する。
    // サービス層テスト（calculator.test.ts など）は @vitest-environment jsdom / node で
    // ファイル単位に上書きできるが、デフォルトを jsdom にすることで
    // UI 結合テスト（issue-020/021）でアノテーション不要になる。
    environment: 'jsdom',
    // @testing-library/jest-dom が expect をグローバルとして参照するため globals: true が必要。
    // false のままだと setupFiles 実行時に "expect is not defined" が発生する。
    globals: true,
  },
})
