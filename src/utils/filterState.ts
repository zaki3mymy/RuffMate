import { debouncedFilter, type FilterCriteria } from './filterRules'

// グローバルなフィルタ状態を管理するクラス
class FilterState {
  private searchTerm = ''
  private categories: string[] = []
  private statuses: string[] = []

  // 検索キーワードを更新
  setSearchTerm(term: string): void {
    this.searchTerm = term
    this.applyFilter()
  }

  // カテゴリフィルタを更新
  setCategories(categories: string[]): void {
    this.categories = categories
    this.applyFilter()
  }

  // ステータスフィルタを更新
  setStatuses(statuses: string[]): void {
    this.statuses = statuses
    this.applyFilter()
  }

  // 現在のフィルタ条件を取得
  getCriteria(): FilterCriteria {
    return {
      searchTerm: this.searchTerm,
      categories: this.categories,
      statuses: this.statuses,
    }
  }

  // 全てのフィルタをクリア
  clear(): void {
    this.searchTerm = ''
    this.categories = []
    this.statuses = []
    this.applyFilter()
  }

  // カテゴリとステータスのみクリア（検索キーワードは保持）
  clearCategoriesAndStatuses(): void {
    this.categories = []
    this.statuses = []
    this.applyFilter()
  }

  // フィルタを適用（debounce付き）
  private applyFilter(): void {
    debouncedFilter(this.getCriteria())
  }
}

// グローバルインスタンス
export const filterState = new FilterState()
