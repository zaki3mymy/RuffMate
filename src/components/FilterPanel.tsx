import { useState, useEffect, useRef } from 'react'
import { filterState } from '../utils/filterState'

interface FilterPanelProps {
  categories: string[]
}

const STATUSES = [
  { value: 'stable', label: 'Stable' },
  { value: 'preview', label: 'Preview' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'removed', label: 'Removed' },
]

export default function FilterPanel({ categories }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showCategories, setShowCategories] = useState(false)
  const [showStatuses, setShowStatuses] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true)

  const categoriesRef = useRef<HTMLDivElement>(null)
  const statusesRef = useRef<HTMLDivElement>(null)

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // カテゴリドロップダウンの外側をクリックした場合
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false)
      }

      // ステータスドロップダウンの外側をクリックした場合
      if (
        statusesRef.current &&
        !statusesRef.current.contains(event.target as Node)
      ) {
        setShowStatuses(false)
      }
    }

    // ドロップダウンが開いているときのみイベントリスナーを追加
    if (showCategories || showStatuses) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategories, showStatuses])

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(newCategories)
    filterState.setCategories(newCategories)
  }

  const handleStatusChange = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]

    setSelectedStatuses(newStatuses)
    filterState.setStatuses(newStatuses)
  }

  const handleClear = () => {
    setSelectedCategories([])
    setSelectedStatuses([])
    // 検索キーワードはクリアせず、カテゴリとステータスのみクリア
    filterState.clearCategoriesAndStatuses()
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedStatuses.length > 0

  return (
    <>
      {/* モバイル用折りたたみボタン */}
      <button
        onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
        className="flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 md:hidden"
        aria-expanded={!isFilterCollapsed}
      >
        <span>フィルタ</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isFilterCollapsed ? '' : 'rotate-180'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className={`bg-gray-50 p-4 ${isFilterCollapsed ? 'hidden md:block md:border-t md:border-gray-200' : 'block border-t border-gray-200'}`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* カテゴリフィルタ */}
          <div className="relative w-full md:w-auto" ref={categoriesRef}>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto"
              aria-expanded={showCategories}
              aria-haspopup="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              カテゴリ
              {selectedCategories.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            {showCategories && (
              <div className="absolute left-0 top-full z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg md:w-64">
                <div className="p-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ステータスフィルタ */}
          <div className="relative w-full md:w-auto" ref={statusesRef}>
            <button
              onClick={() => setShowStatuses(!showStatuses)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto"
              aria-expanded={showStatuses}
              aria-haspopup="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              ステータス
              {selectedStatuses.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            {showStatuses && (
              <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg md:w-48">
                <div className="p-2">
                  {STATUSES.map((status) => (
                    <label
                      key={status.value}
                      className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status.value)}
                        onChange={() => handleStatusChange(status.value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* クリアボタン */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="rounded-lg bg-gray-600 p-2 text-white hover:bg-gray-700"
              aria-label="フィルタをクリア"
              title="フィルタをクリア"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
