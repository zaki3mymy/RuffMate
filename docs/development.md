# 開発ガイド

このドキュメントは、RuffMateの開発に参加する開発者向けの情報をまとめたものです。

## 必要な環境

- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **Python**: 3.8 以上（Ruffの実行に必要）
- **uvx**: Ruffを実行するため（`pip install uv`）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/RuffMate.git
cd RuffMate
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Ruffルール情報の取得

```bash
npm run fetch-rules
```

このコマンドは以下を実行します:
- `uvx ruff --version`: Ruffのバージョンを取得
- `uvx ruff rule --all`: 全ルールのMarkdown形式の情報を取得
- Markdownをパースして`src/data/rules.json`に保存

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:4321` を開きます。

## ディレクトリ構造

```
RuffMate/
├── src/
│   ├── components/        # コンポーネント
│   │   ├── *.astro       # 静的コンポーネント（Astro）
│   │   └── *.tsx         # React Islands（インタラクティブ）
│   ├── data/             # データファイル
│   │   └── rules.json    # ビルド時生成（fetch-rules）
│   ├── layouts/          # レイアウト
│   │   └── Layout.astro
│   ├── pages/            # ページ
│   │   └── index.astro
│   ├── types/            # 型定義
│   │   └── rules.ts
│   └── utils/            # ユーティリティ
│       ├── exportToml.ts
│       ├── filterRules.ts
│       ├── filterState.ts
│       └── ruleSettings.ts
├── scripts/              # ビルドスクリプト
│   └── fetch-rules.ts    # Ruffルール取得スクリプト
├── tests/                # テスト
│   ├── *.test.ts        # ユニットテスト（Vitest）
│   └── e2e/             # E2Eテスト（Playwright）
├── docs/                 # ドキュメント
├── public/               # 静的ファイル
├── astro.config.mjs      # Astro設定
├── tailwind.config.mjs   # TailwindCSS設定
└── package.json
```

## 主要なコマンド

### 開発

```bash
npm run dev           # 開発サーバー起動（http://localhost:4321）
npm run fetch-rules   # Ruffルール情報を取得
```

### ビルド

```bash
npm run build         # プロダクションビルド（fetch-rules含む）
npm run preview       # ビルド結果のプレビュー
```

### テスト

```bash
npm run test          # ユニットテスト実行（Vitest）
npm run test:ui       # Vitestの UIモード
npm run test:e2e      # E2Eテスト実行（Playwright）
```

### コード品質

```bash
npm run check         # 型チェック + Lint + Format チェック
npm run lint          # ESLint実行
npm run lint:fix      # ESLint自動修正
npm run format        # Prettier実行（確認のみ）
npm run format:fix    # Prettier自動修正
```

## 開発ワークフロー

### 1. 新機能の追加

1. **ブランチ作成**

```bash
git checkout -b feature/your-feature-name
```

2. **実装**

必要に応じてコンポーネント、ユーティリティ、テストを作成します。

3. **テスト**

```bash
npm run test          # ユニットテスト
npm run test:e2e      # E2Eテスト
npm run check         # 型チェック + Lint
```

4. **コミット**

```bash
git add .
git commit -m "feat: your feature description"
```

5. **プッシュ & PR**

```bash
git push origin feature/your-feature-name
```

GitHub上でプルリクエストを作成します。

### 2. バグ修正

1. **ブランチ作成**

```bash
git checkout -b bugfix/issue-description
```

2. **修正 & テスト**

バグを修正し、再現テストを追加します。

3. **コミット & PR**

```bash
git commit -m "fix: description of the fix"
git push origin bugfix/issue-description
```

## コンポーネントの作成

### 静的コンポーネント（Astro）

JavaScriptが不要な静的なコンポーネントは、`.astro`ファイルで作成します。

```astro
---
// src/components/Example.astro
interface Props {
  title: string
}

const { title } = Astro.props
---

<div class="example">
  <h2>{title}</h2>
</div>
```

### React Islands（インタラクティブ）

状態管理やユーザー操作が必要なコンポーネントは、`.tsx`ファイルで作成します。

```tsx
// src/components/Example.tsx
import { useState } from 'react'

interface ExampleProps {
  initialValue: string
}

export default function Example({ initialValue }: ExampleProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  )
}
```

使用時は、`client:load`または`client:visible`ディレクティブを指定します:

```astro
<!-- src/pages/index.astro -->
<Example client:load initialValue="test" />
```

**ディレクティブ**:
- `client:load`: ページロード時にすぐハイドレーション
- `client:visible`: ビューポートに表示されたときにハイドレーション
- `client:idle`: メインスレッドがアイドル時にハイドレーション

## フィルタリングの仕組み

RuffMateのフィルタリングは、DOM操作ベースで実装されています。

### データフロー

1. **ユーザー入力**: SearchBar/FilterPanelで検索・フィルタ条件を入力
2. **グローバルステート更新**: `filterState.ts`で条件を保持
3. **フィルタリング実行**: `filterRules.ts`でDOM操作によりルールの表示/非表示を切り替え
4. **イベント発行**: `filter-complete`イベントで結果を通知

### filterState（グローバルステート）

```typescript
// src/utils/filterState.ts
class FilterState {
  private searchTerm = ''
  private categories: string[] = []
  private statuses: string[] = []

  setSearchTerm(term: string) {
    this.searchTerm = term
    this.triggerFilter()
  }

  private triggerFilter() {
    filterRules({
      searchTerm: this.searchTerm,
      categories: this.categories,
      statuses: this.statuses,
    })
  }
}

export const filterState = new FilterState()
```

### filterRules（DOM操作）

```typescript
// src/utils/filterRules.ts
export function filterRules(criteria: FilterCriteria): FilterResult {
  const ruleItems = document.querySelectorAll('.rule-item')

  ruleItems.forEach((item) => {
    if (matchesCriteria(item, criteria)) {
      item.style.display = 'block'
    } else {
      item.style.display = 'none'
    }
  })

  // カスタムイベント発行
  window.dispatchEvent(new CustomEvent('filter-complete', { detail: result }))
}
```

### RuleItem（data-*属性）

`RuleItem.astro`は、フィルタリングに必要な情報を`data-*`属性として持っています:

```astro
<div
  class="rule-item"
  data-code={rule.code}
  data-category={rule.categoryCode}
  data-name={rule.name}
  data-summary={rule.summary}
  data-status={rule.status}
>
```

## localStorage連携

### ruleSettingsStore

ルール設定は`ruleSettingsStore`で管理されます。

**2層構造**:
1. **In-memoryキャッシュ**: 高速アクセス用
2. **localStorage**: 永続化ストレージ

**メソッド**:
- `set(ruleCode, enabled)`: 設定を保存（同期）
- `get(ruleCode)`: 設定を取得（非同期、useEffect内で使用）
- `getSync(ruleCode)`: 設定を同期的に取得（キャッシュのみ）
- `getSyncWithStorage(ruleCode)`: 設定を同期的に取得（localStorage含む）

**使用例**:

```tsx
// トグルスイッチの実装
import { ruleSettingsStore } from '../utils/ruleSettings'

export default function RuleToggle({ ruleCode }: Props) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    ruleSettingsStore.get(ruleCode).then(setEnabled)
  }, [ruleCode])

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    ruleSettingsStore.set(ruleCode, newValue)
  }

  return <button onClick={handleToggle}>...</button>
}
```

**重要**: エクスポート時は`getSyncWithStorage()`を使用してください。`getSync()`では、まだハイドレーションされていないルールの設定が取得できません。

## エクスポート機能の実装

### TOML生成

`generateTomlWithMetadata()`関数でTOMLを生成します:

```typescript
// src/utils/exportToml.ts
export function generateTomlWithMetadata(
  rules: RuffRule[],
  ruffVersion: string
): string {
  const enabledRules = rules.filter(
    (r) => ruleSettingsStore.getSyncWithStorage(r.code) === true
  )
  const disabledRules = rules.filter(
    (r) => ruleSettingsStore.getSyncWithStorage(r.code) === false
  )

  // TOML文字列を生成...
}
```

### クリップボード/ダウンロード

```typescript
// クリップボードにコピー
await navigator.clipboard.writeText(tomlContent)

// ファイルダウンロード
const blob = new Blob([tomlContent], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'pyproject.toml'
a.click()
URL.revokeObjectURL(url)
```

## テストの作成

### ユニットテスト（Vitest）

```typescript
// tests/example.test.ts
import { describe, it, expect } from 'vitest'
import { filterRules } from '../src/utils/filterRules'

describe('filterRules', () => {
  it('should filter rules by search term', () => {
    // テスト実装...
  })
})
```

### E2Eテスト（Playwright）

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test'

test('should filter rules', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="text"]', 'unused')
  // 検証...
})
```

## レスポンシブデザインの実装

TailwindCSSの条件付きクラスを使用します:

```tsx
// モバイル: 縦並び、タブレット以上: 横並び
<div className="flex flex-col md:flex-row">

// モバイル: 全幅、タブレット以上: auto幅
<button className="w-full md:w-auto">

// モバイル: 非表示、タブレット以上: 表示
<span className="hidden md:inline">
```

**ブレークポイント**:
- デフォルト: < 768px（モバイル）
- `md:`: 768px以上（タブレット）
- `lg:`: 1024px以上（デスクトップ）

## パフォーマンス最適化のヒント

### 1. 静的コンポーネントを優先

JavaScriptが不要なコンポーネントは`.astro`ファイルで作成してください。

### 2. client:visibleを活用

画面外のコンポーネントは`client:visible`で遅延ハイドレーションを行います。

### 3. DOM操作でフィルタリング

大量の要素をフィルタリングする場合、再レンダリングよりもDOM操作の方が高速です。

### 4. debounceで入力を遅延処理

検索入力など頻繁に発火するイベントは、debounceで遅延処理を行います。

## デバッグ

### 開発者ツール

- **Console**: `console.log()`でデバッグ情報を出力
- **React DevTools**: React Islandsの状態を確認
- **localStorage**: Application > Local Storage で設定を確認

### localStorageのクリア

```javascript
// ブラウザコンソールで実行
localStorage.clear()
location.reload()
```

## トラブルシューティング

### Q: `fetch-rules`が失敗する

A: `uvx`がインストールされているか確認してください:

```bash
pip install uv
uvx ruff --version
```

### Q: ビルドエラーが発生する

A: 依存関係を再インストールしてみてください:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: 設定が保存されない

A: localStorageが有効か確認してください。プライベートモードでは無効になっている場合があります。

## コーディング規約

- **TypeScript**: 型を明示的に指定
- **ESLint + Prettier**: 自動フォーマットに従う
- **命名規則**: camelCase（変数・関数）、PascalCase（コンポーネント・型）
- **コメント**: 複雑なロジックには日本語コメントを追加

## コントリビューション

プルリクエストを歓迎します！以下のガイドラインに従ってください:

1. **Issue作成**: 大きな変更の場合、まずIssueで議論
2. **ブランチ命名**: `feature/`, `bugfix/`, `docs/`などのプレフィックス
3. **コミットメッセージ**: Conventional Commits形式（`feat:`, `fix:`, `docs:`など）
4. **テスト**: 新機能には必ずテストを追加
5. **ドキュメント**: 必要に応じてドキュメントを更新

## 参考リンク

- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
