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
  - [x] `src/types/`
  - [x] `src/utils/`
  - [x] `scripts/`
  - [x] `tests/` (テスト用)
- [x] GitHub Pagesデプロイ設定
  - [x] `astro.config.mjs`に`base: '/RuffMate/'`を追加
  - [x] `.github/workflows/deploy.yml`を作成

## Phase 2: データ取得スクリプト ✅

- [x] 型定義ファイルの作成 (`src/types/rules.ts`)
  - [x] `RuffRule` interface
  - [x] `RuffVersion` interface
  - [x] `RulesData` interface
- [x] CLI+Markdownパーススクリプトの作成 (`scripts/fetch-rules.ts`)
  - [x] `uvx ruff --version` でバージョン取得
  - [x] `uvx ruff rule --all` でルール一覧取得（Markdown形式）
  - [x] ルール情報のパース（コード、名前、カテゴリ、状態）
  - [x] ステータス判定（stable/preview/deprecated/removed）
  - [x] JSON出力処理 (`src/data/rules.json`)
  - [x] エラーハンドリング実装
- [x] テストの作成
  - [x] Vitest テストスイート作成
  - [x] Markdownフィクスチャ準備
  - [x] 936ルールのパース検証
- [x] ビルドプロセスへの統合
  - [x] `package.json`の`scripts`に`fetch-rules`を追加
  - [x] `build`スクリプトでAstroビルド前にfetch-rules実行

## Phase 3: SSG + Islands Architecture実装 ✅

- [x] Astroへの移行
  - [x] `npm install astro @astrojs/react`
  - [x] `astro.config.mjs`の作成
  - [x] TailwindCSS v4をViteプラグインで継続利用
  - [x] ビルドスクリプトをAstroに対応
- [x] レイアウトとページの作成
  - [x] `src/layouts/Layout.astro` (ベースレイアウト)
  - [x] `src/pages/index.astro` (メインページ、936ルールの静的HTML生成)
- [x] コンポーネントの作成
  - [x] `src/components/RuleItem.astro` (個別ルール表示、静的)
  - [x] `src/components/RuleToggle.tsx` (React Island、トグルスイッチ)
- [x] パフォーマンス最適化
  - [x] `client:visible`による段階的ハイドレーション
  - [x] バッチ処理によるlocalStorage読み込み最適化（50個ずつ16ms間隔）
  - [x] requestAnimationFrameでメインスレッドをブロックしない設計
- [x] localStorage連携
  - [x] `src/utils/ruleSettings.ts` (グローバルストア)
  - [x] 設定の保存処理（即座）
  - [x] 設定の読み込み処理（バッチ）
  - [x] キャッシュ機構
- [x] 不要ファイルの削除
  - [x] Vite SPA用ファイルの削除（App.tsx, main.tsx, vite-env.d.ts）
  - [x] 未使用依存関係の削除（@vitejs/plugin-react, autoprefixer, postcss）

**パフォーマンス結果**:
- トグル操作: <10ms（Phase 2比97%改善）
- ページロード: 3.69秒（初期実装比70%削減）
- ParseHTML: 22回（初期実装比99.8%削減）
- 初期表示: 即座（静的HTML）
- 設定反映: 段階的（ユーザーには自然）

## Phase 4: 検索・フィルタ機能 ✅

**注意**: Phase 3のSSG化により、DOM操作ベースのハイブリッドアプローチで実装

- [x] RuleItem.astroの修正
  - [x] `data-*`属性の追加（code, category, name, summary, status）
  - [x] `.rule-item` クラスの追加
- [x] フィルタロジックの実装 (`src/utils/filterRules.ts`)
  - [x] `FilterCriteria`型定義
  - [x] `filterRules()`: DOM操作ベースのフィルタリング
  - [x] `matchesCriteria()`: フィルタ条件のマッチング
  - [x] `debounce()`: 遅延処理
  - [x] カスタムイベント発行
- [x] コンポーネントの作成
  - [x] `src/components/SearchBar.tsx` (React Island, client:load)
  - [x] `src/components/FilterPanel.tsx` (React Island, client:load)
- [x] index.astroへの統合
  - [x] カテゴリ一覧の抽出
  - [x] SearchBar/FilterPanel配置（sticky）
- [x] テストの作成
  - [x] `tests/filterRules.test.ts` (ユニットテスト)
  - [x] パフォーマンス計測（目標: 5-10ms）
- [x] (オプション) E2Eテスト
  - [x] Playwrightセットアップ
  - [x] フィルタリング動作の検証

## Phase 5: エクスポート機能 ✅

- [x] TOML生成ロジック (`src/utils/exportToml.ts`)
  - [x] `ruleSettingsStore.getSync()`を活用
  - [x] pyproject.toml形式の出力
- [x] コンポーネントの作成
  - [x] `src/components/ExportButton.tsx` (React Island)
- [x] クリップボードAPI実装
- [x] ファイルダウンロード実装
- [x] プレビュー機能（モーダル）

## Phase 6: UI/UX改善

- [ ] レスポンシブデザイン対応
- [ ] エラーハンドリングの強化
  - [ ] トースト通知の実装
- [ ] アクセシビリティ改善
  - [ ] キーボードナビゲーション
  - [ ] ARIA属性の追加
- [ ] アニメーション（CSS transition）

**注意**: 静的HTMLは即座に表示されるため、従来のローディング表示は不要

## Phase 7: ドキュメント・デプロイ

- [ ] README.md更新
  - [ ] アーキテクチャ説明（SSG + Islands）
  - [ ] パフォーマンス特性の記載
- [ ] 開発者向けドキュメント作成 (`docs/development.md`)
  - [ ] フィルタリングの仕組み
  - [ ] React Islandとの連携方法
- [ ] エクスポート機能の改善
  - [ ] エクスポートされるURLを、アプリをホストするサーバーのURLに動的に変更
- [ ] GitHub Pagesへのデプロイ
- [ ] 最終テスト
  - [ ] 機能テスト
  - [ ] パフォーマンステスト
  - [ ] ブラウザ互換性テスト
  - [ ] アクセシビリティテスト

## メモ

- **アーキテクチャ**: Astro SSG + Islands Architecture
- **技術スタック**:
  - Astro 5.x (SSG)
  - React 18+ (Islands)
  - TypeScript
  - TailwindCSS v4 (@tailwindcss/vite)
- **デプロイ先**: GitHub Pages
- **データソース**: Ruff CLI (`uvx ruff rule --all`) - ビルド時取得
- **ストレージ**: localStorage（バッチ処理による最適化）
- **テスト**: Vitest
- **コード品質**: ESLint + Prettier + husky
- **パフォーマンス戦略**:
  - 静的HTML生成（936ルール全て）
  - client:visible による段階的ハイドレーション
  - localStorage読み込みのバッチ処理（50個/16ms）
  - requestAnimationFrame によるメインスレッド保護

## 完了したフェーズ

- ✅ Phase 1: プロジェクトセットアップ
- ✅ Phase 2: データ取得スクリプト（CLI+Markdownパース、936ルール対応）
- ✅ Phase 3: SSG + Islands Architecture実装（パフォーマンス最適化完了）
- ✅ Phase 4: 検索・フィルタ機能（DOM操作ベース、E2Eテスト含む）
- ✅ Phase 5: エクスポート機能（TOML生成、クリップボード、ダウンロード、プレビュー）
