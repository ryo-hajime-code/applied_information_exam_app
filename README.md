## プロジェクト概要
応用情報技術者試験の過去問演習の記録を残すアプリ。<br />
過去問を解いた日付、解いた問題の数、正答した数を入力することで、正答率の推移や学習の記録を可視化できる。<br />
デプロイ先URL：https://applied-information-exam-app.vercel.app/

## スクリーンショット
<img width="1440" height="720" alt="image" src="https://github.com/user-attachments/assets/e4e6ad22-b269-4a58-9b0f-dd995503ff86" />
<br />
<img width="1440" height="720" alt="image" src="https://github.com/user-attachments/assets/c7122ec8-7a7a-4f2d-ad52-6d780a042d34" />

## ディレクトリ構成
```
.
├── docs/
│   ├── 01_requirements.md     # 要件定義書
│   ├── 02_architecture.md     # アーキテクチャ設計書
│   ├── 03_database.md         # データベース設計書
│   └── 04_screen-design.md    # 画面設計書
├── issues/                    # 開発のissue
└── src/                       # ソースコード
```

## 技術スタック
フロントエンド：React, TypeScript<br />
バックエンド：なし（データの保存はLocalStorageとし、必要最低限の機能を最速で動かすため）<br />
デプロイ：Vercel

## ローカル環境の立ち上げ
1. 本リポジトリをクローンする。<br />
2. パッケージを一括でインストールする
```
npm install
```
3. ローカル環境下で立ち上げる
```
npm run dev
```

## 今回の制作を通じて学んだこと・感じたこと
以下の記事を参照ください。<br />
https://zenn.dev/ryo_hajime/articles/40fae3abf21862
