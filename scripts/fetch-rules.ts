import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as cheerio from 'cheerio'
import type { RuffRule, RuffVersion, RulesData } from '../src/types/rules.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RUFF_RULES_URL = 'https://docs.astral.sh/ruff/rules/'
const OUTPUT_PATH = join(__dirname, '../src/data/rules.json')

type RuleStatus = 'stable' | 'preview' | 'deprecated' | 'removed'

/**
 * Ruff公式ドキュメントからHTMLを取得
 */
async function fetchHtml(url: string): Promise<string> {
  console.log('Fetching HTML from:', url)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.text()
}

/**
 * HTMLからRuffバージョンを抽出
 */
function extractVersion($: cheerio.CheerioAPI): RuffVersion {
  const version: RuffVersion = {
    version: 'unknown',
    fetchedAt: new Date().toISOString(),
  }

  // meta[name="generator"]からバージョン情報を取得
  const generatorContent = $('meta[name="generator"]').attr('content')
  if (generatorContent) {
    const match = generatorContent.match(/(\d+\.\d+\.\d+)/)
    if (match) {
      version.version = match[1]
    }
  }

  return version
}

/**
 * ルールのステータスを判定（アイコンから）
 */
function determineStatus(
  statusCell: cheerio.Cheerio<cheerio.Element>
): RuleStatus {
  const statusHtml = statusCell.html() || ''

  if (statusHtml.includes('🧪') || statusHtml.includes('preview')) {
    return 'preview'
  } else if (statusHtml.includes('⚠️') || statusHtml.includes('deprecated')) {
    return 'deprecated'
  } else if (statusHtml.includes('❌') || statusHtml.includes('removed')) {
    return 'removed'
  }

  return 'stable'
}

/**
 * HTMLをパースしてルール一覧を抽出
 */
function parseRules(html: string): RulesData {
  console.log('Parsing HTML...')

  const $ = cheerio.load(html)
  const rules: RuffRule[] = []
  const version = extractVersion($)

  // 各カテゴリのh2要素を検索
  $('h2').each((_, h2Element) => {
    const $h2 = $(h2Element)
    const headingText = $h2.text().trim()

    // カテゴリ名とカテゴリコードを抽出（例: "Airflow (AIR)" -> category="Airflow (AIR)", categoryCode="AIR"）
    const categoryMatch = headingText.match(/^(.+?)\s*\(([A-Z]+)\)$/)
    if (!categoryMatch) return // カテゴリ見出しでない場合はスキップ

    const category = headingText
    const categoryCode = categoryMatch[2]

    // 次のtable要素を取得
    const $table = $h2.nextAll('table').first()
    if ($table.length === 0) return

    // テーブルの各行を処理
    $table.find('tbody tr').each((_, trElement) => {
      const $row = $(trElement)
      const cells = $row.find('td')

      if (cells.length >= 3) {
        const code = $(cells[0]).text().trim()
        const nameCell = $(cells[1])
        const nameLink = nameCell.find('a')
        const name = nameLink.text().trim()
        const summary = $(cells[2]).text().trim()
        const statusCell = $(cells[3])

        // 空のルールコードはスキップ
        if (!code) return

        // ステータスを判定
        const status = determineStatus(statusCell)

        // ドキュメントURLを生成
        const href = nameLink.attr('href') || ''
        const documentUrl = href.startsWith('http')
          ? href
          : `https://docs.astral.sh/ruff/rules/${href}`

        rules.push({
          code,
          name,
          summary,
          category,
          categoryCode,
          status,
          documentUrl,
        })
      }
    })
  })

  console.log(`Found ${rules.length} rules`)
  console.log(`Ruff version: ${version.version}`)

  if (rules.length === 0) {
    console.warn(
      'Warning: No rules found. The HTML structure may have changed.'
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
async function main(): Promise<void> {
  try {
    const html = await fetchHtml(RUFF_RULES_URL)
    const data = parseRules(html)
    saveToFile(data, OUTPUT_PATH)
  } catch (error) {
    console.error('Failed to fetch and parse rules:', error)
    throw error
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
}

// テスト用にエクスポート
export { fetchHtml, parseRules, saveToFile }
