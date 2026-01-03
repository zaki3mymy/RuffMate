// フィルタ条件の型定義
export interface FilterCriteria {
  searchTerm: string
  categories: string[]
  statuses: string[]
}

// フィルタ結果の型定義
export interface FilterResult {
  visibleCount: number
  totalCount: number
}

// DOM要素がフィルタ条件にマッチするかチェック
function matchesCriteria(item: HTMLElement, criteria: FilterCriteria): boolean {
  const { searchTerm, categories, statuses } = criteria

  // 検索キーワードのチェック
  if (searchTerm) {
    const name = item.dataset.ruleName || ''
    const summary = item.dataset.ruleSummary || ''
    const code = item.dataset.ruleCode || ''
    const term = searchTerm.toLowerCase()

    // code, name, summaryのいずれかに検索キーワードが含まれているか
    if (
      !name.includes(term) &&
      !summary.includes(term) &&
      !code.toLowerCase().includes(term)
    ) {
      return false
    }
  }

  // カテゴリフィルタのチェック
  if (categories.length > 0) {
    const category = item.dataset.ruleCategory || ''
    if (!categories.includes(category)) {
      return false
    }
  }

  // ステータスフィルタのチェック
  if (statuses.length > 0) {
    const status = item.dataset.ruleStatus || ''
    if (!statuses.includes(status)) {
      return false
    }
  }

  return true
}

// DOM操作でルールをフィルタリング
export function filterRules(criteria: FilterCriteria): void {
  const items = document.querySelectorAll<HTMLElement>('.rule-item')
  let visibleCount = 0

  items.forEach((item) => {
    const matches = matchesCriteria(item, criteria)
    item.style.display = matches ? '' : 'none'
    if (matches) visibleCount++
  })

  // カスタムイベントで結果を通知
  const result: FilterResult = {
    visibleCount,
    totalCount: items.length,
  }

  window.dispatchEvent(
    new CustomEvent('filter-complete', {
      detail: result,
    })
  )
}

// debounce関数: 連続した呼び出しを遅延させる
export function debounce<F extends (arg: FilterCriteria) => void>(
  func: F,
  wait: number
): (arg: FilterCriteria) => void {
  let timeout: NodeJS.Timeout | null = null

  return (arg: FilterCriteria) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(arg), wait)
  }
}

// debounce付きのfilterRules（300ms遅延）
export const debouncedFilter = debounce(filterRules, 300)
