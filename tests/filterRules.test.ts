import { describe, it, expect, beforeEach, vi } from 'vitest'
import { filterRules, debounce } from '../src/utils/filterRules'

describe('filterRules', () => {
  beforeEach(() => {
    // DOMをリセット
    document.body.innerHTML = ''
  })

  it('検索キーワードに一致するルールのみ表示される', () => {
    // テスト用のDOM要素を作成
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="W503" data-rule-name="line break before operator" data-rule-summary="line break occurred before operator" data-rule-category="W" data-rule-status="deprecated"></div>
    `

    // "import"で検索
    filterRules({
      searchTerm: 'import',
      categories: [],
      statuses: [],
    })

    const items = document.querySelectorAll<HTMLElement>('.rule-item')
    expect(items[0].style.display).toBe('none') // E501は非表示
    expect(items[1].style.display).toBe('') // F401は表示
    expect(items[2].style.display).toBe('none') // W503は非表示
  })

  it('カテゴリフィルタが機能する', () => {
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="W503" data-rule-name="line break before operator" data-rule-summary="line break occurred before operator" data-rule-category="W" data-rule-status="deprecated"></div>
    `

    // カテゴリ"E"でフィルタ
    filterRules({
      searchTerm: '',
      categories: ['E'],
      statuses: [],
    })

    const items = document.querySelectorAll<HTMLElement>('.rule-item')
    expect(items[0].style.display).toBe('') // E501は表示
    expect(items[1].style.display).toBe('none') // F401は非表示
    expect(items[2].style.display).toBe('none') // W503は非表示
  })

  it('ステータスフィルタが機能する', () => {
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="W503" data-rule-name="line break before operator" data-rule-summary="line break occurred before operator" data-rule-category="W" data-rule-status="deprecated"></div>
    `

    // ステータス"deprecated"でフィルタ
    filterRules({
      searchTerm: '',
      categories: [],
      statuses: ['deprecated'],
    })

    const items = document.querySelectorAll<HTMLElement>('.rule-item')
    expect(items[0].style.display).toBe('none') // E501は非表示
    expect(items[1].style.display).toBe('none') // F401は非表示
    expect(items[2].style.display).toBe('') // W503は表示
  })

  it('複数の条件を組み合わせられる', () => {
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="E401" data-rule-name="multiple imports" data-rule-summary="multiple imports on one line" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
    `

    // カテゴリ"E" AND 検索キーワード"import"
    filterRules({
      searchTerm: 'import',
      categories: ['E'],
      statuses: [],
    })

    const items = document.querySelectorAll<HTMLElement>('.rule-item')
    expect(items[0].style.display).toBe('none') // E501は非表示（importを含まない）
    expect(items[1].style.display).toBe('') // E401は表示
    expect(items[2].style.display).toBe('none') // F401は非表示（カテゴリがF）
  })

  it('filter-completeイベントが発行される', () => {
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
    `

    const eventListener = vi.fn()
    window.addEventListener('filter-complete', eventListener)

    filterRules({
      searchTerm: '',
      categories: [],
      statuses: [],
    })

    expect(eventListener).toHaveBeenCalled()
    const event = eventListener.mock.calls[0][0] as CustomEvent
    expect(event.detail.visibleCount).toBe(2)
    expect(event.detail.totalCount).toBe(2)

    window.removeEventListener('filter-complete', eventListener)
  })

  it('フィルタ条件なしで全て表示される', () => {
    document.body.innerHTML = `
      <div class="rule-item" data-rule-code="E501" data-rule-name="line too long" data-rule-summary="line exceeds maximum length" data-rule-category="E" data-rule-status="stable"></div>
      <div class="rule-item" data-rule-code="F401" data-rule-name="unused import" data-rule-summary="module imported but unused" data-rule-category="F" data-rule-status="stable"></div>
    `

    filterRules({
      searchTerm: '',
      categories: [],
      statuses: [],
    })

    const items = document.querySelectorAll<HTMLElement>('.rule-item')
    expect(items[0].style.display).toBe('')
    expect(items[1].style.display).toBe('')
  })
})

describe('debounce', () => {
  it('指定時間内の連続呼び出しが1回にまとめられる', async () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    // 連続で呼び出す
    debouncedFunc({ searchTerm: 'test1', categories: [], statuses: [] })
    debouncedFunc({ searchTerm: 'test2', categories: [], statuses: [] })
    debouncedFunc({ searchTerm: 'test3', categories: [], statuses: [] })

    // すぐには呼ばれない
    expect(func).not.toHaveBeenCalled()

    // 100ms待つ
    await new Promise((resolve) => setTimeout(resolve, 150))

    // 最後の呼び出しのみ実行される
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith({
      searchTerm: 'test3',
      categories: [],
      statuses: [],
    })
  })
})
