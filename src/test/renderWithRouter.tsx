// src/test/renderWithRouter.tsx
// MemoryRouter + Routes を組み合わせて任意のページをレンダリングするテストヘルパー。
//
// なぜ MemoryRouter を使うか:
// jsdom 環境にはブラウザの history API がないため BrowserRouter は使えない。
// MemoryRouter はメモリ上で history を管理するため、ブラウザなしでルーティングを
// シミュレートできる。
//
// initialEntries の使い方:
// - ['/']         : Home 画面から始まる（デフォルト）
// - ['/records']  : RecordList 画面から始まる
// - ['/', '/records'] : Home → RecordList の履歴を持つ（navigate(-1) のテスト用）

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import RecordList from '../pages/RecordList';

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
