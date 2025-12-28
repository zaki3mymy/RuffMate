# RuffMate - Ruff Configuration Manager

## システム概要
Pythonのlintツール「ruff」のルール設定を管理するウェブアプリケーション（SPA）

## プロジェクト状況
- ✅ **計画フェーズ完了** - 実装準備完了
- ⏳ **実装開始待ち**

## 重要ドキュメント
- 📋 **要件定義**: `docs/REQUIREMENTS.md`
- 🏗️ **システム設計**: `docs/ARCHITECTURE.md`
- 📅 **開発計画**: `docs/DEVELOPMENT_PLAN.md`
- 🧪 **テスト戦略**: `docs/TESTING_STRATEGY.md`

## 重要なアーキテクチャ決定事項

### ビルド時データ埋め込み方式
```
Build Time (データ取得・埋め込み) → Runtime (静的データ使用)
```
**理由**: ruff公式サイトへのDDoS攻撃回避のため、ランタイムでの外部API呼び出し禁止

### 技術スタック
- **Core**: React 18 + TypeScript (strict) + Vite
- **State**: Zustand + LocalStorage
- **UI**: Material-UI v5 + 仮想スクロール
- **Test**: TDD + 100%カバレッジ必須 (Vitest/Playwright)

### 型安全性徹底
- アプリケーション: TypeScript strict mode
- **ビルドスクリプト**: TypeScript使用（JavaScript禁止）

## 次回実装開始コマンド
```bash
npm create vite@latest ruffmate -- --template react-ts
cd ruffmate
npm install @mui/material @emotion/react @emotion/styled zustand immer
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

## 開発時の重要制約
1. **TDD必須** - テストファースト、100%カバレッジ
2. **ビルドスクリプトもTypeScript** - 完全な型安全性
3. **ランタイム外部API禁止** - DDoS防止

詳細は各ドキュメントファイルを参照してください。