import { useState, useEffect, useRef } from 'react'
import { type FilterResult } from '../utils/filterRules'
import { filterState } from '../utils/filterState'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // スラッシュキーが押された場合
      if (e.key === '/') {
        // すでにinputやtextarea要素にフォーカスがある場合は無視
        const activeElement = document.activeElement
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement
        ) {
          return
        }

        // 検索ボックスにフォーカス
        e.preventDefault() // デフォルトの '/' 入力を防ぐ
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    filterState.setSearchTerm(value)
  }

  const handleClear = () => {
    setSearchTerm('')
    filterState.setSearchTerm('')
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ルール名、コード、説明で検索..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="ルールを検索"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="検索をクリア"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {resultCount !== null && (
        <span
          className="hidden text-sm text-gray-600 md:inline"
          role="status"
          aria-live="polite"
        >
          {resultCount} / {totalCount} 件
        </span>
      )}
    </div>
  )
}
