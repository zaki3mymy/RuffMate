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
    filterState.clear()
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedStatuses.length > 0

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        {/* カテゴリフィルタ */}
        <div className="relative" ref={categoriesRef}>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-expanded={showCategories}
            aria-haspopup="true"
          >
            カテゴリ
            {selectedCategories.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {selectedCategories.length}
              </span>
            )}
          </button>

          {showCategories && (
            <div className="absolute left-0 top-full z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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
        <div className="relative" ref={statusesRef}>
          <button
            onClick={() => setShowStatuses(!showStatuses)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-expanded={showStatuses}
            aria-haspopup="true"
          >
            ステータス
            {selectedStatuses.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {selectedStatuses.length}
              </span>
            )}
          </button>

          {showStatuses && (
            <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
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
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  )
}
