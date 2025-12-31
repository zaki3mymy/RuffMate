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
    it('should parse Markdown and extract rules correctly', () => {
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
      expect(result.rules.length).toBeGreaterThan(900)
    })

    it('should parse individual rules with correct structure', () => {
      const result = parseRules(sampleMarkdown)
      const firstRule = result.rules[0]

      // 必須フィールドのチェック
      expect(firstRule).toHaveProperty('code')
      expect(firstRule).toHaveProperty('name')
      expect(firstRule).toHaveProperty('summary')
      expect(firstRule).toHaveProperty('category')
      expect(firstRule).toHaveProperty('categoryCode')
      expect(firstRule).toHaveProperty('status')
      expect(firstRule).toHaveProperty('documentUrl')

      // 型チェック
      expect(typeof firstRule.code).toBe('string')
      expect(typeof firstRule.name).toBe('string')
      expect(typeof firstRule.summary).toBe('string')
      expect(typeof firstRule.category).toBe('string')
      expect(typeof firstRule.categoryCode).toBe('string')
      expect(['stable', 'preview', 'deprecated', 'removed']).toContain(
        firstRule.status
      )
      expect(typeof firstRule.documentUrl).toBe('string')

      // 新しいオプショナルフィールドのチェック
      if (firstRule.whyBad) {
        expect(typeof firstRule.whyBad).toBe('string')
      }
      if (firstRule.example) {
        expect(typeof firstRule.example).toBe('string')
      }
    })

    it('should parse specific known rules correctly', () => {
      const result = parseRules(sampleMarkdown)

      // AIR001ルールを検索
      const air001 = result.rules.find((r) => r.code === 'AIR001')
      expect(air001).toBeDefined()
      if (air001) {
        expect(air001.name).toBe('airflow-variable-name-task-id-mismatch')
        expect(air001.categoryCode).toBe('AIR')
        expect(air001.category).toContain('Airflow')
        expect(air001.status).toBe('stable')
        expect(air001.documentUrl).toBe(
          'https://docs.astral.sh/ruff/rules/airflow-variable-name-task-id-mismatch/'
        )
        // Markdownパースで抽出されるフィールドを確認
        expect(air001.summary).toBeTruthy()
        expect(air001.whyBad).toBeTruthy()
        expect(air001.example).toBeTruthy()
      }
    })

    it('should correctly set rule statuses', () => {
      const result = parseRules(sampleMarkdown)

      // すべてのステータスが有効な値であることを確認
      result.rules.forEach((rule) => {
        expect(['stable', 'preview', 'deprecated', 'removed']).toContain(
          rule.status
        )
      })

      // 現在の実装ではすべてstableとして扱われる
      const statuses = new Set(result.rules.map((r) => r.status))
      expect(statuses.has('stable')).toBe(true)
    })

    it('should extract category codes correctly', () => {
      const result = parseRules(sampleMarkdown)

      // カテゴリコードのユニークな一覧
      const categoryCodes = new Set(result.rules.map((r) => r.categoryCode))
      expect(categoryCodes.size).toBeGreaterThan(0)

      // すべてのカテゴリコードが大文字のアルファベット（と数字）であることを確認
      categoryCodes.forEach((code) => {
        expect(code).toMatch(/^[A-Z0-9]+$/)
      })
    })

    it('should generate correct document URLs', () => {
      const result = parseRules(sampleMarkdown)

      result.rules.forEach((rule) => {
        expect(rule.documentUrl).toMatch(
          /^https:\/\/docs\.astral\.sh\/ruff\/rules\//
        )
        expect(rule.documentUrl).toContain(rule.name)
      })
    })

    it('should handle empty Markdown gracefully', () => {
      const emptyMarkdown = ''
      const result = parseRules(emptyMarkdown)

      expect(result.rules).toEqual([])
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

  describe('Integration', () => {
    it('should parse sample Markdown and produce valid output', () => {
      const result = parseRules(sampleMarkdown)

      // 最低限のルール数を確認
      expect(result.rules.length).toBeGreaterThan(900)

      // すべてのルールが必須フィールドを持つことを確認
      result.rules.forEach((rule) => {
        expect(rule.code).toBeTruthy()
        expect(rule.name).toBeTruthy()
        expect(rule.summary).toBeTruthy()
        expect(rule.category).toBeTruthy()
        expect(rule.categoryCode).toBeTruthy()
        expect(rule.status).toBeTruthy()
        expect(rule.documentUrl).toBeTruthy()
      })

      // 重複するルールコードがないことを確認
      const codes = result.rules.map((r) => r.code)
      const uniqueCodes = new Set(codes)
      expect(codes.length).toBe(uniqueCodes.size)
    })
  })
})
