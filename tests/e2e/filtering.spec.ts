import { test, expect } from '@playwright/test'

test.describe('RuffMate Filtering Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('ページロード時に全てのルールが表示される', async ({ page }) => {
    // ルール要素が存在することを確認
    const ruleItems = page.locator('.rule-item')
    const count = await ruleItems.count()

    // 936ルールが全て表示されていることを確認
    expect(count).toBeGreaterThan(900)

    // 結果カウントが表示されることを確認
    await expect(page.getByRole('status')).toContainText(`${count} / ${count}`)
  })

  test('検索キーワードでルールが絞り込まれる', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // "import"で検索
    await searchInput.fill('import')

    // 結果が更新されるのを待つ
    await page.waitForTimeout(400) // debounce (300ms) + 少し余裕

    // 結果カウントが更新されていることを確認
    const resultText = await page.getByRole('status').textContent()
    expect(resultText).toMatch(/\d+ \/ \d+ 件/)

    // 全ルール数より少ないことを確認（絞り込まれている）
    const match = resultText?.match(/(\d+) \/ (\d+)/)
    if (match) {
      const visibleCount = parseInt(match[1])
      const totalCount = parseInt(match[2])
      expect(visibleCount).toBeLessThan(totalCount)
      expect(visibleCount).toBeGreaterThan(0)
    }
  })

  test('×ボタンで検索キーワードがクリアされる', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // 検索キーワードを入力
    await searchInput.fill('import')
    await page.waitForTimeout(400)

    // ×ボタンが表示されることを確認
    const clearButton = page.getByRole('button', { name: '検索をクリア' })
    await expect(clearButton).toBeVisible()

    // ×ボタンをクリック
    await clearButton.click()

    // 検索ボックスが空になることを確認
    await expect(searchInput).toHaveValue('')

    // 全ルールが再表示されることを確認
    const resultText = await page.getByRole('status').textContent()
    const match = resultText?.match(/(\d+) \/ (\d+)/)
    if (match) {
      const visibleCount = parseInt(match[1])
      const totalCount = parseInt(match[2])
      expect(visibleCount).toBe(totalCount)
    }
  })

  test('カテゴリフィルタでルールが絞り込まれる', async ({ page }) => {
    // カテゴリボタンをクリック
    const categoryButton = page.getByRole('button', { name: 'カテゴリ' })
    await categoryButton.click()

    // ドロップダウンが表示されることを確認
    await expect(page.locator('label').filter({ hasText: /^E$/ })).toBeVisible()

    // カテゴリ "E" を選択
    await page.locator('label').filter({ hasText: /^E$/ }).click()

    // 結果が更新されるのを待つ
    await page.waitForTimeout(400)

    // 結果カウントが更新され、絞り込まれていることを確認
    const resultText = await page.getByRole('status').textContent()
    const match = resultText?.match(/(\d+) \/ (\d+)/)
    if (match) {
      const visibleCount = parseInt(match[1])
      const totalCount = parseInt(match[2])
      expect(visibleCount).toBeLessThan(totalCount)
      expect(visibleCount).toBeGreaterThan(0)
    }

    // カテゴリボタンにバッジが表示されることを確認
    await expect(categoryButton).toContainText('1')
  })

  test('ステータスフィルタでルールが絞り込まれる', async ({ page }) => {
    // ステータスボタンをクリック
    const statusButton = page.getByRole('button', { name: 'ステータス' })
    await statusButton.click()

    // ドロップダウンが表示されることを確認
    await expect(
      page.locator('label').filter({ hasText: 'Preview' })
    ).toBeVisible()

    // ステータス "Preview" を選択
    await page.locator('label').filter({ hasText: 'Preview' }).click()

    // 結果が更新されるのを待つ
    await page.waitForTimeout(400)

    // 結果カウントが更新され、絞り込まれていることを確認
    const resultText = await page.getByRole('status').textContent()
    const match = resultText?.match(/(\d+) \/ (\d+)/)
    if (match) {
      const visibleCount = parseInt(match[1])
      const totalCount = parseInt(match[2])
      expect(visibleCount).toBeLessThan(totalCount)
      expect(visibleCount).toBeGreaterThan(0)
    }

    // ステータスボタンにバッジが表示されることを確認
    await expect(statusButton).toContainText('1')
  })

  test('複数の条件を組み合わせて絞り込める', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // カテゴリフィルタを設定
    const categoryButton = page.getByRole('button', { name: 'カテゴリ' })
    await categoryButton.click()
    await page.locator('label').filter({ hasText: /^F$/ }).click()
    await page.waitForTimeout(400)

    // カテゴリFのみの結果カウントを取得
    const categoryOnlyText = await page.getByRole('status').textContent()
    const categoryOnlyMatch = categoryOnlyText?.match(/(\d+) \/ (\d+)/)
    const categoryOnlyCount = categoryOnlyMatch
      ? parseInt(categoryOnlyMatch[1])
      : 0

    // 検索キーワードを追加
    await searchInput.fill('import')
    await page.waitForTimeout(400)

    // 結果がさらに絞り込まれることを確認
    const combinedText = await page.getByRole('status').textContent()
    const combinedMatch = combinedText?.match(/(\d+) \/ (\d+)/)
    const combinedCount = combinedMatch ? parseInt(combinedMatch[1]) : 0

    expect(combinedCount).toBeLessThanOrEqual(categoryOnlyCount)
  })

  test('クリアボタンでカテゴリとステータスがクリアされる（検索キーワードは保持）', async ({
    page,
  }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // 検索キーワードを入力
    await searchInput.fill('import')
    await page.waitForTimeout(400)

    // カテゴリフィルタを設定
    const categoryButton = page.getByRole('button', { name: 'カテゴリ' })
    await categoryButton.click()
    await page.locator('label').filter({ hasText: /^E$/ }).click()

    // クリアボタンが表示されることを確認
    const clearButton = page.getByRole('button', { name: 'クリア' })
    await expect(clearButton).toBeVisible()

    // クリアボタンをクリック
    await clearButton.click()
    await page.waitForTimeout(400)

    // 検索キーワードは保持されていることを確認
    await expect(searchInput).toHaveValue('import')

    // カテゴリフィルタがクリアされていることを確認
    await expect(categoryButton).not.toContainText('1')

    // クリアボタンが非表示になることを確認
    await expect(clearButton).not.toBeVisible()
  })

  test('ドロップダウンメニューが外側クリックで閉じる', async ({ page }) => {
    const categoryButton = page.getByRole('button', { name: 'カテゴリ' })

    // カテゴリボタンをクリックしてドロップダウンを開く
    await categoryButton.click()

    // ドロップダウンが表示されることを確認
    const dropdown = page.locator('label').filter({ hasText: /^E$/ })
    await expect(dropdown).toBeVisible()

    // ドロップダウンの外側をクリック
    await page.locator('header').click()

    // ドロップダウンが非表示になることを確認
    await expect(dropdown).not.toBeVisible()
  })

  test('検索結果のカウント表示が正確', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // まず全ルール数を取得
    const initialText = await page.getByRole('status').textContent()
    const initialMatch = initialText?.match(/(\d+) \/ (\d+)/)
    const totalCount = initialMatch ? parseInt(initialMatch[2]) : 0

    // 検索して結果を確認
    await searchInput.fill('unused')
    await page.waitForTimeout(400)

    const resultText = await page.getByRole('status').textContent()
    expect(resultText).toMatch(/\d+ \/ \d+ 件/)

    // 結果カウントの合計が変わっていないことを確認
    const match = resultText?.match(/(\d+) \/ (\d+)/)
    if (match) {
      expect(parseInt(match[2])).toBe(totalCount)
    }
  })

  test('存在しないキーワードで検索すると0件になる', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'ルールを検索' })

    // 存在しないキーワードで検索
    await searchInput.fill('xyzabc123nonexistent')
    await page.waitForTimeout(400)

    // 0件であることを確認
    const resultText = await page.getByRole('status').textContent()
    expect(resultText).toMatch(/0 \/ \d+ 件/)
  })
})
