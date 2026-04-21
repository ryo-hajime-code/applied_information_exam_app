# Issue-019: 結合テスト — テスト環境構築

## 概要

結合テストの実行環境を整備する。
パッケージ導入・Vitest の設定・全テストファイルで共用する `renderWithRouter` ヘルパーを用意することで、
Issue-019 以降の結合テスト実装をスムーズに進められる状態にする。

---

## タスク

### 1. パッケージ追加

- [ ] 必要パッケージを追加する

  ```bash
  npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom
  ```

### 2. Vitest セットアップファイルの作成と登録

- [ ] `src/test/setup.ts` を作成し、jest-dom のカスタムマッチャーを登録する

  ```ts
  // src/test/setup.ts
  import '@testing-library/jest-dom';
  ```

- [ ] `vite.config.ts` の `test.setupFiles` に `src/test/setup.ts` を追加する

### 3. renderWithRouter ヘルパーの作成

- [ ] `src/test/renderWithRouter.tsx` を作成する

  ```tsx
  // MemoryRouter + Routes をセットして任意のページをレンダリングするヘルパー。
  // initialEntries でテスト開始パスを制御する。
  // navigate(-1) のテストは initialEntries に 2 つのパスを渡すことでシミュレートする。
  import { render } from '@testing-library/react';
  import { MemoryRouter, Route, Routes } from 'react-router-dom';
  import Home from '../../pages/Home';
  import RecordList from '../../pages/RecordList';

  export const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/records" element={<RecordList />} />
        </Routes>
      </MemoryRouter>
    );
  };
  ```

---

## 完了条件

- `npm test` がエラーなく実行できる
- `renderWithRouter` ヘルパーが `src/test/renderWithRouter.tsx` に存在し、Issue-020・021 で import できる状態である

---

## 依存関係

- 依存するIssue: Issue-013, Issue-014（ページ実装が完了していないと renderWithRouter がコンパイルエラーになる）
- このIssueに依存するIssue: Issue-020, Issue-021
