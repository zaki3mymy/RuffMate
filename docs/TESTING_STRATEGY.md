# Ruff Configuration Manager - テスト戦略書

## 概要

本ドキュメントでは、Ruff設定管理ウェブアプリケーションにおける **テストカバレッジ100%達成** のための包括的なテスト戦略を定義する。

### 基本方針
- **テスト駆動開発（TDD）**: 実装前にテストコードを記述
- **100%カバレッジ必須**: 関数・分岐・条件・行のすべてを網羅
- **型安全テスト**: TypeScript strict modeでの完全な型チェック
- **自動化**: CI/CDでの自動テスト実行とカバレッジ監視

## テストカバレッジ目標

### 100%カバレッジの定義

#### カバレッジ種別
1. **関数カバレッジ（Function Coverage）**: 100%
   - すべての関数・メソッドが少なくとも1回実行される

2. **分岐カバレッジ（Branch Coverage）**: 100%
   - if文、switch文、三項演算子等のすべての分岐が実行される

3. **条件カバレッジ（Condition Coverage）**: 100%
   - 論理演算子（&&, ||）の各条件がtrue/false両方で実行される

4. **行カバレッジ（Line Coverage）**: 100%
   - 実行可能なすべての行が実行される

#### 適用範囲
- **アプリケーションコード**: `src/` 配下の全ファイル
- **ビルドスクリプト**: `scripts/` 配下の全TypeScriptファイル
- **テストヘルパー**: `tests/helpers/` 配下の全ユーティリティ
- **除外対象**: 型定義ファイル（`.d.ts`）、設定ファイル

## テスト駆動開発（TDD）実施方針

### TDDサイクル

```
1. 🔴 RED: 失敗するテストを書く
   ↓
2. 🟢 GREEN: テストが通る最小限の実装
   ↓
3. 🔵 REFACTOR: コードを改善（テストは維持）
   ↓
4. 繰り返し
```

### TDD適用レベル

#### レベル1: 単機能TDD
- 個別関数・メソッドレベルでのTDD適用
- ユーティリティ関数、データ変換処理等

#### レベル2: モジュールTDD
- クラス・サービス・ストア単位でのTDD適用
- 複数関数の連携テスト

#### レベル3: コンポーネントTDD
- React コンポーネント単位でのTDD適用
- プロパティ・イベント・描画の全パターンテスト

#### レベル4: 統合TDD
- 複数モジュール間の連携テスト
- データフロー全体のテスト

## テスト種別・戦略

### 1. ユニットテスト

#### 1.1 ビルドスクリプトテスト

**対象**: `scripts/*.ts`（TypeScript化されたビルドスクリプト）

```typescript
// scripts/__tests__/fetchRuffData.test.ts
describe('fetchRuffData', () => {
  beforeEach(() => {
    // モック初期化
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('ruff公式ドキュメントからデータを取得できる', async () => {
      // Given: モックデータの準備
      const mockHtml = '<html>...</html>';
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      // When: データ取得実行
      const result = await fetchRuffData();

      // Then: 結果検証
      expect(result).toBeDefined();
      expect(result.rules).toHaveLength(greaterThan(0));
    });

    it('リトライ機構が正常に動作する', async () => {
      // 1回目失敗、2回目成功のシナリオテスト
    });

    it('タイムアウト設定が有効である', async () => {
      // タイムアウト動作のテスト
    });
  });

  describe('異常系', () => {
    it('ネットワークエラー時に適切にエラーハンドリングする', async () => {
      // Given: ネットワークエラー
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

      // When & Then: エラーハンドリング検証
      await expect(fetchRuffData()).rejects.toThrow('Network Error');
    });

    it('不正なHTMLに対してエラーを返す', async () => {
      // 不正HTML処理のテスト
    });
  });
});
```

**カバレッジ要求**:
- 全関数・メソッド: 100%
- 全エラーハンドリング分岐: 100%
- 全リトライ・タイムアウトパス: 100%

#### 1.2 サービス層テスト

**対象**: `src/services/*.ts`

```typescript
// src/services/__tests__/configGenerator.test.ts
describe('ConfigGenerator', () => {
  let generator: ConfigGenerator;

  beforeEach(() => {
    generator = new ConfigGenerator();
  });

  describe('generatePyprojectToml', () => {
    it('基本的なpyproject.tomlを生成できる', () => {
      // Given
      const rules: RuffRule[] = [
        { code: 'E501', enabled: false, ignoreReason: '行長制限調整' },
        { code: 'W503', enabled: true }
      ];

      // When
      const result = generator.generatePyprojectToml(rules);

      // Then
      expect(result.content).toContain('select = ["ALL"]');
      expect(result.content).toContain('"E501",  # 行長制限調整');
      expect(result.content).not.toContain('W503');
    });

    it('空のルール配列でも正常に動作する', () => {
      // エッジケーステスト
    });

    it('特殊文字を含むコメントを適切にエスケープする', () => {
      // セキュリティテスト
    });
  });
});
```

#### 1.3 状態管理テスト

**対象**: `src/store/*.ts`（Zustand ストア）

```typescript
// src/store/__tests__/rulesStore.test.ts
describe('useRulesStore', () => {
  beforeEach(() => {
    useRulesStore.getState().resetStore();
  });

  describe('toggleRule', () => {
    it('ルールの有効/無効を切り替えられる', () => {
      // Given
      const initialRules = mockRules();
      useRulesStore.getState().setRules(initialRules);

      // When
      useRulesStore.getState().toggleRule('E501', false, '行長制限');

      // Then
      const state = useRulesStore.getState();
      const rule = state.rules.find(r => r.code === 'E501');
      expect(rule?.enabled).toBe(false);
      expect(rule?.ignoreReason).toBe('行長制限');
    });

    it('存在しないルールに対して適切にエラーハンドリングする', () => {
      // エラーケーステスト
    });
  });

  describe('LocalStorage永続化', () => {
    it('状態変更がLocalStorageに保存される', () => {
      // 永続化テスト
    });
  });
});
```

#### 1.4 ユーティリティ・ヘルパーテスト

**対象**: `src/utils/*.ts`、`src/hooks/*.ts`

### 2. コンポーネントテスト

#### 2.1 React コンポーネントテスト

**ツール**: `@testing-library/react` + `@testing-library/jest-dom`

```typescript
// src/components/rules/__tests__/RuleCard.test.tsx
describe('RuleCard', () => {
  const mockRule: RuffRule = {
    code: 'E501',
    name: 'line-too-long',
    description: '行が長すぎます',
    enabled: true,
    category: 'pycodestyle',
    legendInfo: { status: 'stable', fixable: true }
  };

  describe('レンダリング', () => {
    it('ルール情報が正しく表示される', () => {
      // Given
      render(<RuleCard rule={mockRule} onToggle={jest.fn()} />);

      // Then
      expect(screen.getByText('E501')).toBeInTheDocument();
      expect(screen.getByText('line-too-long')).toBeInTheDocument();
      expect(screen.getByText('行が長すぎます')).toBeInTheDocument();
    });

    it('有効状態がスイッチに反映される', () => {
      // スイッチ状態テスト
    });
  });

  describe('ユーザーインタラクション', () => {
    it('スイッチ切り替え時にonToggleが呼ばれる', () => {
      // Given
      const mockToggle = jest.fn();
      render(<RuleCard rule={mockRule} onToggle={mockToggle} />);

      // When
      fireEvent.click(screen.getByRole('switch'));

      // Then
      expect(mockToggle).toHaveBeenCalledWith('E501', false);
    });

    it('キーボードナビゲーションが機能する', () => {
      // アクセシビリティテスト
    });
  });

  describe('エラー状態', () => {
    it('不正なpropsに対して適切なエラー表示をする', () => {
      // エラー状態テスト
    });
  });
});
```

#### 2.2 カスタムフックテスト

```typescript
// src/hooks/__tests__/useFilteredRules.test.ts
describe('useFilteredRules', () => {
  it('検索クエリでルールをフィルタリングする', () => {
    // Given
    const rules = mockRules();
    const { result } = renderHook(() =>
      useFilteredRules(rules, 'E501', {})
    );

    // Then
    expect(result.current.filteredRules).toHaveLength(1);
    expect(result.current.filteredRules[0].code).toBe('E501');
  });

  it('パフォーマンス最適化（useMemo）が機能する', () => {
    // メモ化テスト
  });
});
```

### 3. 統合テスト

#### 3.1 データフロー統合テスト

```typescript
// src/__tests__/integration/dataFlow.test.ts
describe('データフロー統合テスト', () => {
  it('静的データ読み込み→状態管理→UI表示の全フローが正常動作する', async () => {
    // Given: 静的データの準備
    const mockData = generateMockRuffData();
    jest.mock('../../assets/data/ruff-rules.json', () => mockData);

    // When: アプリケーション初期化
    render(<App />);

    // Then: UI に正しくデータが表示される
    await waitFor(() => {
      expect(screen.getByText('E501')).toBeInTheDocument();
    });
  });

  it('設定変更→LocalStorage保存→再読み込みの永続化フローが機能する', async () => {
    // 永続化統合テスト
  });
});
```

#### 3.2 ビルドプロセス統合テスト

```typescript
// scripts/__tests__/integration/buildProcess.test.ts
describe('ビルドプロセス統合テスト', () => {
  it('データ取得→パース→JSON生成→埋め込みの全フローが正常動作する', async () => {
    // Given: モックHTMLデータ
    const mockHtml = generateMockRuffDocsHtml();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml)
    });

    // When: ビルドスクリプト実行
    await runBuildScript();

    // Then: 正しいJSONが生成される
    const generatedData = JSON.parse(
      fs.readFileSync('data/ruff-rules.json', 'utf-8')
    );
    expect(generatedData.rules).toBeDefined();
    expect(generatedData.rules.length).toBeGreaterThan(0);
  });
});
```

### 4. E2Eテスト

#### 4.1 Playwright による E2Eテスト

```typescript
// tests/e2e/userScenarios.spec.ts
import { test, expect } from '@playwright/test';

describe('ユーザーシナリオ E2Eテスト', () => {
  test('ルール設定→pyproject.toml生成→ダウンロードの完全フロー', async ({ page }) => {
    // Given: アプリケーションにアクセス
    await page.goto('/');

    // When: ルール設定変更
    await page.click('[data-testid="rule-E501-toggle"]');
    await page.fill('[data-testid="rule-E501-reason"]', 'プロジェクト固有の行長制限');

    // When: 設定を出力
    await page.click('[data-testid="export-config"]');

    // Then: pyproject.tomlが正しく生成される
    const configText = await page.locator('[data-testid="config-preview"]').textContent();
    expect(configText).toContain('select = ["ALL"]');
    expect(configText).toContain('"E501"');
    expect(configText).toContain('プロジェクト固有の行長制限');
  });

  test('検索・フィルタ機能の動作確認', async ({ page }) => {
    // 検索・フィルタのE2Eテスト
  });

  test('レスポンシブデザインの動作確認', async ({ page }) => {
    // Given: モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // Then: モバイルレイアウトが適用される
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

#### 4.2 クロスブラウザテスト

```typescript
// tests/e2e/crossBrowser.spec.ts
['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`${browserName} ブラウザテスト`, () => {
    test('基本機能がすべてのブラウザで動作する', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      // 基本機能テスト
      await page.goto('/');
      await expect(page.locator('[data-testid="rule-list"]')).toBeVisible();
    });
  });
});
```

### 5. パフォーマンステスト

```typescript
// tests/performance/performanceTest.spec.ts
describe('パフォーマンステスト', () => {
  test('800+ルール表示のレンダリング性能', async ({ page }) => {
    await page.goto('/');

    // パフォーマンス測定開始
    const startTime = Date.now();

    // 全ルールの読み込み完了を待つ
    await page.waitForSelector('[data-testid="rule-list-complete"]');

    const loadTime = Date.now() - startTime;

    // 3秒以内の初期表示を検証
    expect(loadTime).toBeLessThan(3000);
  });

  test('仮想スクロールの性能確認', async ({ page }) => {
    // 仮想スクロール性能テスト
  });
});
```

## カバレッジ測定・監視

### 測定ツール

#### 1. Vitest + c8
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        'tests/fixtures/'
      ],
      all: true,
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    }
  }
});
```

#### 2. カバレッジレポート出力

```bash
# ユニット・統合テスト実行＆カバレッジ測定
npm run test:coverage

# カバレッジHTMLレポート生成
npm run coverage:html

# カバレッジ結果をCIに送信（Codecov等）
npm run coverage:upload
```

### 3. CI/CDでのカバレッジ監視

```yaml
# .github/workflows/test.yml
name: Test & Coverage
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Coverage threshold check
        run: |
          if [ "$(npm run coverage:check)" != "100%" ]; then
            echo "❌ Coverage is below 100%"
            exit 1
          fi

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## テスト環境・ツール設定

### 開発環境セットアップ

#### 1. 依存関係インストール
```bash
# テストフレームワーク
npm install --save-dev vitest @vitest/ui c8

# React テスト
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E テスト
npm install --save-dev @playwright/test

# モック・テストユーティリティ
npm install --save-dev jest-environment-jsdom msw
```

#### 2. テスト設定ファイル

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// MSW サーバー設定
beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// LocalStorage モック
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});
```

#### 3. モックサーバー設定

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('https://docs.astral.sh/ruff/rules/', (req, res, ctx) => {
    return res(ctx.text(mockRuffDocsHtml));
  }),
];
```

## テスト実行・自動化

### スクリプト設定

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e",
    "coverage:html": "c8 report --reporter html",
    "coverage:check": "c8 check-coverage --branches 100 --functions 100 --lines 100 --statements 100"
  }
}
```

### Husky による自動テスト

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:run",
      "pre-push": "npm run test:coverage && npm run coverage:check"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run --bail"
    ]
  }
}
```

## カバレッジ達成戦略

### 段階的カバレッジ向上

#### フェーズ1: 基盤カバレッジ（目標：80%）
- ビルドスクリプト・サービス層のユニットテスト
- 基本的なコンポーネントテスト

#### フェーズ2: 統合カバレッジ（目標：95%）
- データフロー統合テスト
- エラーケース・エッジケーステスト

#### フェーズ3: 完全カバレッジ（目標：100%）
- 未カバーの全分岐・条件のテスト
- 例外処理・エラーハンドリングの完全テスト

### カバレッジギャップ特定・解決

#### 1. カバレッジレポート分析
```bash
# 未カバー箇所の詳細表示
npm run coverage:html
# → coverage/index.html でビジュアル確認

# コマンドラインでの詳細表示
npx c8 report --reporter text-summary
npx c8 report --reporter text
```

#### 2. 未カバー分岐の特定
```typescript
// カバレッジ不足箇所の例
function processRule(rule: RuffRule) {
  if (rule.enabled) {
    return formatEnabledRule(rule);
  } else if (rule.ignoreReason) {
    return formatIgnoredRuleWithReason(rule);  // ← この分岐が未テスト
  } else {
    return formatIgnoredRule(rule);
  }
}

// 対応テスト
describe('processRule', () => {
  it('理由付き無効ルールを正しくフォーマットする', () => {
    // Given
    const rule: RuffRule = {
      code: 'E501',
      enabled: false,
      ignoreReason: '行長制限調整'
    };

    // When
    const result = processRule(rule);

    // Then
    expect(result).toContain('行長制限調整');
  });
});
```

## テスト保守・メンテナンス

### テストコード品質管理

#### 1. テスト命名規則
```typescript
// ❌ Bad
test('test1', () => {});

// ✅ Good
test('有効なルールがpyproject.tomlのignoreに含まれない', () => {});

// ✅ Better (Given-When-Then)
test('無効ルールに理由が設定されている場合、コメント付きでignoreに追加される', () => {});
```

#### 2. テストデータ管理
```typescript
// tests/fixtures/mockData.ts
export const createMockRule = (overrides: Partial<RuffRule> = {}): RuffRule => ({
  code: 'E501',
  name: 'line-too-long',
  description: '行が長すぎます',
  enabled: true,
  category: 'pycodestyle',
  legendInfo: { status: 'stable', fixable: true },
  ...overrides
});

export const createMockRules = (count: number = 10): RuffRule[] =>
  Array.from({ length: count }, (_, i) =>
    createMockRule({ code: `E${500 + i}` })
  );
```

#### 3. テスト実行時間最適化
```typescript
// 並列実行設定
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2
      }
    }
  }
});
```

### 継続的テストメンテナンス

#### 1. テストの定期見直し
- **月次**: テストカバレッジレポートの詳細分析
- **機能追加時**: 関連テストの影響範囲チェック
- **リファクタリング時**: テスト重複・冗長性の排除

#### 2. フレイキーテスト対策
```typescript
// タイムアウト・リトライ設定
test('非同期処理のテスト', async () => {
  // Given
  const promise = fetchData();

  // When & Then - 適切なタイムアウト設定
  await expect(promise).resolves.toBeDefined();
}, 10000); // 10秒タイムアウト

// 条件待ちの適切な実装
await waitFor(() => {
  expect(screen.getByText('Loading...')).not.toBeInTheDocument();
}, { timeout: 5000 });
```

## まとめ

本テスト戦略により、以下を達成する：

### 達成目標
- **100%テストカバレッジ**: すべての関数・分岐・条件・行をカバー
- **TDD実践**: テストファーストによる堅牢な設計
- **自動化**: CI/CDでの継続的品質監視
- **保守性**: 高品質なテストコードによる長期保守性確保

### 期待効果
- **バグ発見率向上**: 実装前テストによる早期バグ発見
- **リファクタリング安全性**: 包括的テストによる安全な改修
- **開発速度向上**: テスト自動化による開発効率向上
- **品質保証**: 100%カバレッジによる完全品質保証

この戦略に従って、最高品質のRuff設定管理アプリケーションを構築する。