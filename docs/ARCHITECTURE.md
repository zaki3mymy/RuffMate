# Ruff Configuration Manager - システム設計書

## アーキテクチャ概要

### システム全体構成

```
Build Time:                          Runtime:
┌─────────────────────────┐         ┌─────────────────────────────────────────────────┐
│   Build Environment     │         │           Browser Client (SPA)                 │
├─────────────────────────┤         ├─────────────────────────────────────────────────┤
│  ┌──────────────────┐   │   ──►   │  ┌────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Data Fetch       │   │         │  │  UI Layer  │  │ State Layer │  │ Embedded│ │
│  │ Script           │   │         │  │ (React +   │◄─┤ (Zustand)   │◄─┤ Rules   │ │
│  │                  │   │         │  │ Material)  │  │             │  │ Data    │ │
│  └──────────────────┘   │         │  └────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────┘         └─────────────────────────────────────────────────┘
          │                                                                │
          ▼                                                                ▼
┌─────────────────────┐                                       ┌──────────────────┐
│   Ruff Official     │                                       │   LocalStorage   │
│   Documentation     │                                       │ (User Settings)  │
│  (docs.astral.sh)   │                                       └──────────────────┘
└─────────────────────┘
```

### 技術スタック詳細

#### Core Framework
- **React 18**: 最新のConcurrent Features対応
- **TypeScript 4.9+**: Strict mode、完全な型安全性
- **Vite 4**: 高速ビルド・HMR対応

#### 状態管理
- **Zustand**: 軽量（2.9kB）、Fluxベース、TypeScript完全対応
- **Immer**: 不変データ操作の簡略化（Zustandと組み合わせ）

#### UI・スタイリング
- **Material-UI v5**: MUI System、sx prop活用
- **Emotion**: CSS-in-JS、動的スタイリング
- **React Virtual**: 仮想スクロール実装

#### データ・永続化
- **React Query v4**: データフェッチング、キャッシュ、同期
- **LocalStorage API**: 設定永続化
- **IndexedDB**: 大容量データキャッシュ（将来拡張用）

#### テスト・品質
- **Vitest**: 高速ユニットテスト（Jest互換）
- **Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト・ブラウザ自動化
- **ESLint + Prettier**: コード品質・フォーマット

## データ設計

### Core Data Types

```typescript
// Core Rule Interface
interface RuffRule {
  code: string;              // 例: "E501", "F401"
  name: string;             // Rule名前
  category: string;         // 例: "pycodestyle", "pyflakes"
  description: string;      // ルール説明
  example?: string;         // 違反コード例
  fixedExample?: string;    // 修正後コード例
  enabled: boolean;         // ユーザー有効設定
  ignoreReason?: string;    // 無効化理由コメント

  // Official Metadata
  legendInfo: {
    status: 'stable' | 'deprecated' | 'preview';
    fixable: boolean;
    ecosystemSpecific?: string[];  // 特定エコシステム専用ルール (FastAPI, Airflow等)
  };

  // UI State
  isExpanded?: boolean;     // 詳細表示状態
  lastModified?: Date;      // 最終変更日時
}

// Category Management
interface RuffCategory {
  id: string;               // 内部識別子 (例: "pycodestyle")
  name: string;            // UI表示名 (例: "Python Code Style")
  description: string;     // カテゴリ説明
  ruleCount: number;       // 含まれるルール数
  enabledCount: number;    // 有効ルール数 (UI表示: "15/23 enabled")
  enabled: boolean;        // カテゴリ全体の有効状態
}

// Application State
interface AppState {
  // Rule Data
  rules: RuffRule[];
  categories: RuffCategory[];

  // UI State
  selectedCategory: string | null;
  searchQuery: string;
  filterOptions: FilterOptions;
  viewMode: 'grid' | 'list' | 'detailed';  // ルール表示形式切り替え

  // Data Management
  lastUpdated: Date;
  ruffVersion: string;      // データ取得時のruffバージョン
  isLoading: boolean;
  error: string | null;
}

interface FilterOptions {
  status: ('enabled' | 'disabled')[];
  legend: ('stable' | 'deprecated' | 'preview')[];
  fixable: boolean | null;
  ecosystem: string[];
}
```

### データフロー設計

```
Build Time Data Preparation:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Build Script    │──►│ Data Fetcher     │──►│ Parse & JSON    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │ Official Docs    │    │ Static JSON     │
                    │ (Scraping)       │    │ (Embedded)      │
                    └──────────────────┘    └─────────────────┘

Runtime User Interaction:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ App Initialize  │──►│ Load Static Data │──►│ Zustand Store   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ UI Component    │──►│ Zustand Action   │──►│ State Update    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │ React Re-render  │    │ LocalStorage    │
                    │                  │    │ (User Settings) │
                    └──────────────────┘    └─────────────────┘
```

## コンポーネント設計

### アプリケーション階層

```
App (Router)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── SearchBar
│   │   └── DataUpdateButton
│   ├── Sidebar
│   │   ├── CategoryFilter
│   │   ├── LegendFilter
│   │   └── ViewModeSelector
│   └── Footer
│       ├── ConfigExporter
│       └── StatsDisplay
└── Main Content
    ├── RuleManager (Main Container)
    │   ├── RuleGrid/RuleList
    │   │   └── RuleCard (Virtualized)
    │   ├── RuleDetailModal
    │   └── BulkActionToolbar
    └── ErrorBoundary
```

## 実装上の注意点

### パフォーマンス考慮事項
- **仮想スクロール必須**: 800+ルールの表示には仮想スクロール実装が必要
- **検索の最適化**: リアルタイム検索にはデバウンス（200ms推奨）を適用
- **メモ化戦略**: フィルタリング結果、カテゴリ統計等の重い計算は useMemo で最適化
- **コード分割**: 非クリティカルなコンポーネント（モーダル、設定画面）は lazy loading

### データ取得・管理
- **ビルド時データフェッチ**: 公式ドキュメントからのデータ取得はビルドプロセスでのみ実行
- **静的データ埋め込み**: 取得したルールデータは JSON として静的アセットに埋め込み
- **ビルド時エラーハンドリング**: データ取得失敗時のビルド失敗とフォールバック機構
- **バージョン管理**: ビルド時に取得したruffバージョンを埋め込みデータに含める
- **データ更新**: 新しいルール情報取得にはアプリケーション再ビルド・デプロイが必要

### 状態管理
- **永続化**: ユーザー設定（enabled/disabled, ignoreReason）のみを永続化
- **不変性**: Immerを使用した安全な状態更新
- **開発者ツール**: Zustand devtools による状態デバッグ対応

### セキュリティ
- **CSP設定**: 外部リソースへのランタイムアクセス不要のため厳格なCSP適用可能
- **データサニタイゼーション**: ビルド時に取得したHTMLの適切なサニタイズとJSON化
- **XSS対策**: 静的データのため XSS リスクは大幅に軽減、出力時のエスケープ処理
- **ビルド時セキュリティ**: ビルド環境でのデータ取得時のセキュリティ検証

### UI/UX
- **レスポンシブ対応**: モバイル・タブレット・デスクトップの3段階ブレークポイント
- **アクセシビリティ**: ARIA属性、キーボードナビゲーション、色覚多様性対応
- **エラー表示**: ユーザーフレンドリーなエラーメッセージとフォールバック機能

### デプロイメント
- **ビルド時データ取得**: CI/CD 環境でのビルド時インターネット接続とデータ取得権限が必要
- **Docker**: ビルド時の外部アクセス許可、マルチステージビルドによるイメージサイズ最適化
- **静的ホスティング**: 外部API依存なしの完全静的配信、高いキャッシュ効率
- **CI/CDパイプライン**: データ取得失敗時のビルド中断とエラーハンドリング
- **環境変数管理**: ビルド時の設定切り替え（データソースURL、タイムアウト設定等）

## ディレクトリ構成

```
src/
├── components/                 # React Components
│   ├── common/                # Reusable components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── SearchBar/
│   │   └── ErrorBoundary/
│   ├── rules/                 # Rule management components
│   │   ├── RuleManager/
│   │   ├── RuleCard/
│   │   ├── RuleGrid/
│   │   ├── RuleDetailModal/
│   │   └── CategoryPanel/
│   ├── config/                # Configuration components
│   │   ├── ConfigExporter/
│   │   ├── ConfigImporter/
│   │   └── ConfigPreview/
│   └── layout/                # Layout components
│       ├── AppLayout/
│       └── PageContainer/
├── services/                  # Business logic
│   ├── configGenerator.ts
│   ├── storageManager.ts
│   ├── dataLoader.ts         # Static data loader
│   └── validationService.ts
├── store/                     # State management
│   ├── rulesStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── hooks/                     # Custom React hooks
│   ├── useRulesData.ts
│   ├── useLocalStorage.ts
│   ├── useVirtualizedRules.ts
│   └── useDebounce.ts
├── types/                     # TypeScript definitions
│   ├── ruffTypes.ts
│   ├── configTypes.ts
│   └── apiTypes.ts
├── utils/                     # Utility functions
│   ├── htmlParser.ts
│   ├── configValidator.ts
│   ├── categoryHelper.ts
│   └── constants.ts
├── styles/                    # Styling
│   ├── theme.ts              # MUI theme
│   ├── globalStyles.ts
│   └── components/           # Component-specific styles
├── assets/                    # Static assets
│   ├── icons/
│   ├── images/
│   └── data/                 # Embedded rule data
│       └── ruff-rules.json   # Build-time generated rules (final)
├── data/                      # Build-time generated data
│   └── ruff-rules.json       # Static rule data (intermediate output)
├── tests/                     # Test utilities
│   ├── __mocks__/
│   ├── fixtures/
│   └── helpers/
└── scripts/                   # Build-time scripts
    ├── fetchRuffData.js       # Data fetcher script
    ├── parseRuffData.js       # HTML parser & JSON converter
    └── validateData.js        # Data validation script
```

