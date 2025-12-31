import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  executeCommand,
  parseRules,
  saveToFile,
} from '../scripts/fetch-rules.js'
import type { RulesData } from '../src/types/rules.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FIXTURE_PATH = join(__dirname, 'fixtures/ruff-rules.md')
const TEST_OUTPUT_PATH = join(__dirname, 'output/test-rules.json')

describe('fetch-rules', () => {
  let sampleMarkdown: string

  beforeEach(() => {
    // サンプルMarkdownを読み込み
    sampleMarkdown = readFileSync(FIXTURE_PATH, 'utf-8')
  })

  describe('executeCommand', () => {
    it('should execute command and return output', () => {
      // 実際のコマンドを実行するのではなく、単純なテストコマンドを使用
      const result = executeCommand('echo "test output"')
      expect(result).toBe('test output')
    })
  })

  describe('parseRules', () => {
    it('複数のルールをパースしてルール数が正しいこと', () => {
      const result = parseRules(sampleMarkdown)

      // 基本的な構造チェック
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('rules')
      expect(Array.isArray(result.rules)).toBe(true)

      // バージョン情報チェック
      expect(result.version).toHaveProperty('version')
      expect(result.version).toHaveProperty('fetchedAt')
      expect(typeof result.version.version).toBe('string')
      expect(typeof result.version.fetchedAt).toBe('string')

      // ルール数チェック
      expect(result.rules.length).toBe(6)
      // stable: 2, removed: 1, preview: 1, deprecated: 2
      expect(result.rules.filter((r) => r.status == 'stable').length).toBe(2)
      expect(result.rules.filter((r) => r.status == 'removed').length).toBe(1)
      expect(result.rules.filter((r) => r.status == 'preview').length).toBe(1)
      expect(result.rules.filter((r) => r.status == 'deprecated').length).toBe(
        2
      )
    })

    it('stableであるルールをパースできること', () => {
      // prepare
      const ruleText = [
        '# sample-rule (SAM001)',
        '',
        'Derived from the **Sample** linter',
        '',
        '## What it does',
        'sample rule',
        '',
        '## Why is this bad?',
        'this is sample',
        '',
        'and new line',
        '',
        '## Example',
        '```python',
        'incorrect code',
        '',
        'Use instead:',
        '```python',
        'correct code',
        '```',
      ]
      const md = ruleText.join('\n')

      // exec
      const result = parseRules(md)

      // verify
      // ルールが1つだけ
      expect(result.rules.length).toBe(1)
      // フィールドのチェック
      const rule = result.rules[0]
      expect(rule.code).toBe('SAM001')
      expect(rule.name).toBe('sample-rule')
      expect(rule.summary).toBe('sample rule')
      expect(rule.category).toBe('Sample')
      expect(rule.categoryCode).toBe('SAM')
      expect(rule.status).toBe('stable')
      expect(rule.documentUrl).toBe(
        'https://docs.astral.sh/ruff/rules/sample-rule/'
      )
      expect(rule.whyBad).toBe('this is sample\n\nand new line')
      expect(rule.example).toBe(
        '```python\nincorrect code\n\nUse instead:\n```python\ncorrect code\n```'
      )
    })

    it('previewであるルールをパースできること', () => {
      // prepare
      const ruleText = [
        '# sample-rule (SAM001)',
        '',
        'Derived from the **Sample** linter',
        '',
        'This rule is in preview and is not stable. The `--preview` flag is required for use.',
        '',
        '## What it does',
        'sample rule',
        '',
        '## Why is this bad?',
        'this is sample',
        '',
        'and new line',
        '',
        '## Example',
        '```python',
        'incorrect code',
        '',
        'Use instead:',
        '```python',
        'correct code',
        '```',
      ]
      const md = ruleText.join('\n')

      // exec
      const result = parseRules(md)

      // verify
      // ルールが1つだけ
      expect(result.rules.length).toBe(1)
      // フィールドのチェック
      const rule = result.rules[0]
      expect(rule.code).toBe('SAM001')
      expect(rule.name).toBe('sample-rule')
      expect(rule.summary).toBe('sample rule')
      expect(rule.category).toBe('Sample')
      expect(rule.categoryCode).toBe('SAM')
      expect(rule.status).toBe('preview')
      expect(rule.documentUrl).toBe(
        'https://docs.astral.sh/ruff/rules/sample-rule/'
      )
      expect(rule.whyBad).toBe('this is sample\n\nand new line')
      expect(rule.example).toBe(
        '```python\nincorrect code\n\nUse instead:\n```python\ncorrect code\n```'
      )
    })

    it('deprecatedであるルールをパースできること(## Deprecated)', () => {
      // prepare
      const ruleText = [
        '# sample-rule (SAM001)',
        '',
        'Derived from the **Sample** linter',
        '',
        '## Deprecated',
        '',
        "This rule has been deprecated as it's highly opinionated and overly strict in most cases.",
        '',
        '## What it does',
        'sample rule',
        '',
        '## Why is this bad?',
        'this is sample',
        '',
        'and new line',
        '',
        '## Example',
        '```python',
        'incorrect code',
        '',
        'Use instead:',
        '```python',
        'correct code',
        '```',
      ]
      const md = ruleText.join('\n')

      // exec
      const result = parseRules(md)

      // verify
      // ルールが1つだけ
      expect(result.rules.length).toBe(1)
      // フィールドのチェック
      const rule = result.rules[0]
      expect(rule.code).toBe('SAM001')
      expect(rule.name).toBe('sample-rule')
      expect(rule.summary).toBe('sample rule')
      expect(rule.category).toBe('Sample')
      expect(rule.categoryCode).toBe('SAM')
      expect(rule.status).toBe('deprecated')
      expect(rule.documentUrl).toBe(
        'https://docs.astral.sh/ruff/rules/sample-rule/'
      )
      expect(rule.whyBad).toBe('this is sample\n\nand new line')
      expect(rule.example).toBe(
        '```python\nincorrect code\n\nUse instead:\n```python\ncorrect code\n```'
      )
    })

    it('deprecatedであるルールをパースできること(## Deprecation)', () => {
      // prepare
      const ruleText = [
        '# sample-rule (SAM001)',
        '',
        'Derived from the **Sample** linter',
        '',
        '## Deprecation',
        '',
        "This rule has been deprecated as it's highly opinionated and overly strict in most cases.",
        '',
        '## What it does',
        'sample rule',
        '',
        '## Why is this bad?',
        'this is sample',
        '',
        'and new line',
        '',
        '## Example',
        '```python',
        'incorrect code',
        '',
        'Use instead:',
        '```python',
        'correct code',
        '```',
      ]
      const md = ruleText.join('\n')

      // exec
      const result = parseRules(md)

      // verify
      // ルールが1つだけ
      expect(result.rules.length).toBe(1)
      // フィールドのチェック
      const rule = result.rules[0]
      expect(rule.code).toBe('SAM001')
      expect(rule.name).toBe('sample-rule')
      expect(rule.summary).toBe('sample rule')
      expect(rule.category).toBe('Sample')
      expect(rule.categoryCode).toBe('SAM')
      expect(rule.status).toBe('deprecated')
      expect(rule.documentUrl).toBe(
        'https://docs.astral.sh/ruff/rules/sample-rule/'
      )
      expect(rule.whyBad).toBe('this is sample\n\nand new line')
      expect(rule.example).toBe(
        '```python\nincorrect code\n\nUse instead:\n```python\ncorrect code\n```'
      )
    })

    it('removedであるルールをパースできること', () => {
      // prepare
      const ruleText = [
        '# sample-rule (SAM001)',
        '',
        'Derived from the **Sample** linter',
        '',
        '## Removed',
        'This rule has been removed because type checkers can infer this type without annotation.',
        '',
        '## What it does',
        'sample rule',
        '',
        '## Why is this bad?',
        'this is sample',
        '',
        'and new line',
        '',
        '## Example',
        '```python',
        'incorrect code',
        '',
        'Use instead:',
        '```python',
        'correct code',
        '```',
      ]
      const md = ruleText.join('\n')

      // exec
      const result = parseRules(md)

      // verify
      // ルールが1つだけ
      expect(result.rules.length).toBe(1)
      // フィールドのチェック
      const rule = result.rules[0]
      expect(rule.code).toBe('SAM001')
      expect(rule.name).toBe('sample-rule')
      expect(rule.summary).toBe('sample rule')
      expect(rule.category).toBe('Sample')
      expect(rule.categoryCode).toBe('SAM')
      expect(rule.status).toBe('removed')
      expect(rule.documentUrl).toBe(
        'https://docs.astral.sh/ruff/rules/sample-rule/'
      )
      expect(rule.whyBad).toBe('this is sample\n\nand new line')
      expect(rule.example).toBe(
        '```python\nincorrect code\n\nUse instead:\n```python\ncorrect code\n```'
      )
    })
  })

  describe('saveToFile', () => {
    it('should save rules data to JSON file', () => {
      const testData: RulesData = {
        version: {
          version: '1.0.0',
          fetchedAt: new Date().toISOString(),
        },
        rules: [
          {
            code: 'TEST001',
            name: 'test-rule',
            summary: 'Test rule summary',
            category: 'Test (TEST)',
            categoryCode: 'TEST',
            status: 'stable',
            documentUrl: 'https://example.com/test-rule',
          },
        ],
      }

      // ファイルを保存
      saveToFile(testData, TEST_OUTPUT_PATH)

      // ファイルが存在することを確認
      expect(existsSync(TEST_OUTPUT_PATH)).toBe(true)

      // ファイル内容を読み込んで確認
      const savedContent = readFileSync(TEST_OUTPUT_PATH, 'utf-8')
      const savedData = JSON.parse(savedContent)

      expect(savedData).toEqual(testData)

      // クリーンアップ
      if (existsSync(TEST_OUTPUT_PATH)) {
        unlinkSync(TEST_OUTPUT_PATH)
      }
    })
  })
})
