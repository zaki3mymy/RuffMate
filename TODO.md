# RuffMate 開発TODO

## Phase 1: プロジェクトセットアップ ✅

- [x] Vite + React + TypeScript プロジェクトの初期化
  - [x] `npm create vite@latest . -- --template react-ts`
  - [x] 依存関係のインストール
- [x] TailwindCSSのセットアップ
  - [x] `npm install tailwindcss @tailwindcss/vite` (v4)
  - [x] `src/index.css`にTailwind directivesを追加
- [x] 追加パッケージのインストール
  - [x] `npm install -D @types/node` (Node.js型定義)
  - [x] `npm install -D tsx` (TypeScriptスクリプト実行)
  - [x] ESLint + Prettier + husky の導入
  - [x] Vitest のセットアップ
- [x] ディレクトリ構造の構築
  - [x] `src/components/`
  - [x] `src/hooks/`
  - [x] `src/types/`
  - [x] `src/utils/`
  - [x] `scripts/`
  - [x] `tests/` (テスト用)
- [x] GitHub Pagesデプロイ設定
  - [x] `vite.config.ts`に`base: '/RuffMate/'`を追加
  - [x] `.github/workflows/deploy.yml`を作成

## Phase 2: データ取得スクリプト ✅

- [x] 型定義ファイルの作成 (`src/types/rules.ts`)
  - [x] `RuffRule` interface (whyBad, example フィールド追加)
  - [x] `RuffVersion` interface
  - [x] `RulesData` interface
  - [x] `RuleSettings` interface
- [x] CLI+Markdownパーススクリプトの作成 (`scripts/fetch-rules.ts`)
  - [x] `uvx ruff --version` でバージョン取得
  - [x] `uvx ruff rule --all` でルール一覧取得（Markdown形式）
  - [x] ルール情報のパース（コード、名前、カテゴリ、状態、whyBad、example）
  - [x] ステータス判定（stable/preview/deprecated/removed）
  - [x] JSON出力処理 (`dist/data/rules.json`)
  - [x] エラーハンドリング実装
- [x] テストの作成
  - [x] Vitest テストスイート作成
  - [x] Markdownフィクスチャ準備
  - [x] 936ルールのパース検証
- [x] ビルドプロセスへの統合
  - [x] `package.json`の`scripts`に`fetch-rules`を追加
  - [x] `build`スクリプトでvite build後にfetch-rules実行

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

- 技術スタック: React 18+ + TypeScript + Vite + TailwindCSS v4
- デプロイ先: GitHub Pages
- データソース: Ruff CLI (`uvx ruff rule --all`) - ビルド時取得
- ストレージ: localStorage
- テスト: Vitest
- コード品質: ESLint + Prettier + husky

## 完了したフェーズ

- ✅ Phase 1: プロジェクトセットアップ
- ✅ Phase 2: データ取得スクリプト（CLI+Markdownパース、936ルール対応）
