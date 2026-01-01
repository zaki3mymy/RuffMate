import { useState, useEffect } from 'react'
import { debouncedFilter, type FilterResult } from '../utils/filterRules'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  useEffect(() => {
    const handleFilterComplete = (e: Event) => {
      const customEvent = e as CustomEvent<FilterResult>
      setResultCount(customEvent.detail.visibleCount)
      setTotalCount(customEvent.detail.totalCount)
    }

    window.addEventListener('filter-complete', handleFilterComplete)
    return () =>
      window.removeEventListener('filter-complete', handleFilterComplete)
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    debouncedFilter({
      searchTerm: value,
      categories: [],
      statuses: [],
    })
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="ルール名、コード、説明で検索..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="ルールを検索"
      />
      {resultCount !== null && (
        <span
          className="text-sm text-gray-600"
          role="status"
          aria-live="polite"
        >
          {resultCount} / {totalCount} 件
        </span>
      )}
    </div>
  )
}
