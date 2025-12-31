# RuffMate

Ruff設定を簡単に管理できるウェブアプリケーション

## 概要

RuffMateは、PythonのコードフォーマッターであるRuffの設定を視覚的に管理し、`pyproject.toml`形式でエクスポートできるウェブアプリケーションです。

## 主な機能

- ルール一覧の表示と有効/無効の切り替え
- 除外理由をコメントとして記録
- テキスト検索とカテゴリフィルタ
- `pyproject.toml`形式でのエクスポート
- ブラウザに設定を保存（localStorage）

## 解決する課題

1. Ruffのルールをすべて有効にしたいが、ルール間の競合や不要なルールがある
2. 除外したルールの理由が記録されず、他のプロジェクトに引き継げない
3. 設定ファイルだけでは、なぜそのルールを除外したのかが分からない

## 技術スタック

- React 18+ with TypeScript
- Vite
- TailwindCSS
- localStorage API
- GitHub Pages

## 開発状況

現在開発中です。進捗は[TODO.md](./TODO.md)を参照してください。

## ライセンス

MIT
