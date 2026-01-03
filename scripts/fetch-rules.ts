import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import type { RuffRule, RuffVersion, RulesData } from '../src/types/rules.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OUTPUT_PATH = join(__dirname, '../src/data/rules.json')

type RuleStatus = 'stable' | 'preview' | 'deprecated' | 'removed'

/**
 * CLIコマンドを実行して出力を取得
 */
function executeCommand(command: string): string {
  console.log('Executing command:', command)

  try {
    const output = execSync(command, { encoding: 'utf-8' })
    return output.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Command execution failed: ${error.message}`)
    }
    throw error
  }
}

/**
 * CLIからRuffバージョンを取得
 */
function getRuffVersion(): RuffVersion {
  const output = executeCommand('uvx ruff --version')

  // 出力例: "ruff 0.14.10" から "0.14.10" を抽出
  const match = output.match(/ruff\s+(\d+\.\d+\.\d+)/)
  const version = match ? match[1] : 'unknown'

  return {
    version,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Markdownテキストから指定セクションの内容を抽出
 */
function extractSection(
  markdown: string,
  sectionTitle: string
): string | undefined {
  const regex = new RegExp(`## ${sectionTitle}\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = markdown.match(regex)
  return match ? match[1].trim() : undefined
}

/**
 * ルールの状態を推測する
 */
function _guessStatus(block: string): RuleStatus {
  // preview?
  if (block.match(/.*`--preview`.*/)) {
    return 'preview'
  }
  // deprecated?
  else if (
    extractSection(block, 'Deprecated') ||
    extractSection(block, 'Deprecation')
  ) {
    return 'deprecated'
  }
  // removed?
  else if (extractSection(block, 'Removed')) {
    return 'removed'
  } else {
    return 'stable'
  }
}

/**
 * CLIからのMarkdown出力をパースしてルール一覧を抽出
 */
function parseRules(markdown: string): RulesData {
  console.log('Parsing Markdown output from CLI...')

  const rules: RuffRule[] = []
  const version = getRuffVersion()

  // 各ルールは "# rule-name (CODE)" で始まる
  const ruleBlocks = markdown.split(/\n(?=# [a-z])/g)

  for (const block of ruleBlocks) {
    if (!block.trim()) continue

    // ルールコードと名前を抽出
    const headerMatch = block.match(/^#\s+(.+?)\s+\(([A-Z0-9]+)\)/)
    if (!headerMatch) continue

    const name = headerMatch[1].trim()
    const code = headerMatch[2].trim()

    // カテゴリを抽出: "Derived from the **CategoryName** linter."
    const categoryMatch = block.match(/Derived from the \*\*(.+?)\*\* linter/)
    if (!categoryMatch) continue

    const category = categoryMatch[1].trim()
    // カテゴリコードはルールコードのアルファベット部分
    const categoryCode = code.match(/^([A-Z]+)/)?.[1] || code

    // "What it does" セクションから概要を取得
    const whatItDoes = extractSection(block, 'What it does')
    const summary = whatItDoes || ''

    // "Why is this bad?" セクションを取得
    const whyBad = extractSection(block, 'Why is this bad\\?')

    // "Example" セクションを取得
    const example = extractSection(block, 'Example')

    // ドキュメントURLを生成
    const documentUrl = `https://docs.astral.sh/ruff/rules/${name}/`

    const status: RuleStatus = _guessStatus(block)

    rules.push({
      code,
      name,
      summary,
      category,
      categoryCode,
      status,
      documentUrl,
      whyBad,
      example,
    })
  }

  console.log(`Found ${rules.length} rules`)
  console.log(`Ruff version: ${version.version}`)

  if (rules.length === 0) {
    console.warn(
      'Warning: No rules found. The Markdown structure may have changed.'
    )
  }

  return {
    version,
    rules,
  }
}

/**
 * JSONデータをファイルに保存
 */
function saveToFile(data: RulesData, outputPath: string): void {
  const outputDir = dirname(outputPath)
  mkdirSync(outputDir, { recursive: true })

  writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`Successfully wrote rules to ${outputPath}`)
}

/**
 * メイン処理
 */
function main(): void {
  try {
    console.log('Fetching rules from Ruff CLI...')
    const markdown = executeCommand('uvx ruff rule --all')
    const data = parseRules(markdown)
    saveToFile(data, OUTPUT_PATH)
  } catch (error) {
    console.error('Failed to fetch and parse rules:', error)
    throw error
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// テスト用にエクスポート
export { executeCommand, getRuffVersion, parseRules, saveToFile }
