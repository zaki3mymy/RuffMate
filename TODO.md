# RuffMate 開発TODO

## Phase 1: プロジェクトセットアップ

- [ ] Vite + React + TypeScript プロジェクトの初期化
  - [ ] `npm create vite@latest . -- --template react-ts`
  - [ ] 依存関係のインストール
- [ ] TailwindCSSのセットアップ
  - [ ] `npm install -D tailwindcss postcss autoprefixer`
  - [ ] `npx tailwindcss init -p`
  - [ ] `src/index.css`にTailwind directivesを追加
- [ ] 追加パッケージのインストール
  - [ ] `npm install cheerio` (スクレイピング用)
  - [ ] `npm install -D @types/node` (Node.js型定義)
- [ ] ディレクトリ構造の構築
  - [ ] `src/components/`
  - [ ] `src/hooks/`
  - [ ] `src/types/`
  - [ ] `src/utils/`
  - [ ] `src/data/`
  - [ ] `scripts/`
  - [ ] `docs/`
- [ ] GitHub Pagesデプロイ設定
  - [ ] `vite.config.ts`に`base: '/RuffMate/'`を追加
  - [ ] `.github/workflows/deploy.yml`を作成

## Phase 2: データ取得スクリプト

- [ ] 型定義ファイルの作成 (`src/types/rules.ts`)
  - [ ] `RuffRule` interface
  - [ ] `RuffVersion` interface
  - [ ] `RulesData` interface
  - [ ] `RuleSettings` interface
- [ ] スクレイピングスクリプトの作成 (`scripts/fetch-rules.js`)
  - [ ] Ruff公式ドキュメントからHTML取得
  - [ ] ルール情報のパース（コード、名前、カテゴリ、状態）
  - [ ] JSON出力処理
  - [ ] エラーハンドリング実装
- [ ] ビルドプロセスへの統合
  - [ ] `package.json`の`scripts`に`fetch-rules`を追加
  - [ ] `prebuild`スクリプトの設定

## Phase 3: コア機能実装

- [ ] カスタムフックの作成
  - [ ] `src/hooks/useLocalStorage.ts`
  - [ ] `src/hooks/useRules.ts`
- [ ] コンポーネントの作成
  - [ ] `src/App.tsx` (メインレイアウト)
  - [ ] `src/components/RuleList.tsx` (ルール一覧コンテナ)
  - [ ] `src/components/RuleItem.tsx` (個別ルール表示)
- [ ] localStorage連携
  - [ ] 設定の保存処理
  - [ ] 設定の読み込み処理
  - [ ] リセット機能

## Phase 4: 検索・フィルタ機能

- [ ] フィルタロジックの実装 (`src/utils/filterRules.ts`)
- [ ] コンポーネントの作成
  - [ ] `src/components/SearchBar.tsx`
  - [ ] `src/components/FilterPanel.tsx`
- [ ] パフォーマンス最適化
  - [ ] `useMemo`でフィルタ結果をメモ化
  - [ ] 検索のdebounce処理

## Phase 5: エクスポート機能

- [ ] TOML生成ロジック (`src/utils/exportToml.ts`)
- [ ] コンポーネントの作成
  - [ ] `src/components/ExportButton.tsx`
- [ ] クリップボードAPI実装
- [ ] ファイルダウンロード実装
- [ ] プレビュー機能（モーダル）

## Phase 6: UI/UX改善

- [ ] レスポンシブデザイン対応
- [ ] ローディング状態の実装
- [ ] エラーハンドリングの強化
- [ ] トースト通知の実装
- [ ] アクセシビリティ改善
- [ ] アニメーションの追加

## Phase 7: ドキュメント・デプロイ

- [ ] README.md更新（詳細版）
- [ ] 使い方ドキュメント作成 (`docs/usage.md`)
- [ ] 開発者向けドキュメント作成 (`docs/development.md`)
- [ ] GitHub Pagesへのデプロイ
- [ ] 最終テスト
  - [ ] 機能テスト
  - [ ] パフォーマンステスト
  - [ ] ブラウザ互換性テスト
  - [ ] モバイル対応テスト
  - [ ] アクセシビリティテスト

## メモ

- 技術スタック: React 18+ + TypeScript + Vite + TailwindCSS
- デプロイ先: GitHub Pages
- データソース: Ruff公式ドキュメント（ビルド時取得）
- ストレージ: localStorage
