import { useState, useEffect } from 'react'
import type { RuffRule } from '../types/rules'
import { generateTomlWithMetadata } from '../utils/exportToml'

interface ExportButtonProps {
  rules: RuffRule[]
  ruffVersion: string
}

export default function ExportButton({
  rules,
  ruffVersion,
}: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [tomlContent, setTomlContent] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  )

  const handleExport = () => {
    const toml = generateTomlWithMetadata(rules, ruffVersion)
    setTomlContent(toml)
    setShowModal(true)
    setCopyStatus('idle')
  }

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal])

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tomlContent)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([tomlContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pyproject.toml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={handleExport}
        className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
        aria-label="設定をエクスポート"
      >
        エクスポート
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <div
            className="mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  pyproject.toml プレビュー
                </h2>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="閉じる"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="overflow-y-auto p-4 sm:p-6">
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100 sm:p-4 sm:text-sm">
                <code>{tomlContent}</code>
              </pre>
            </div>

            {/* フッター */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${
                    copyStatus === 'copied'
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      : copyStatus === 'error'
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                  }`}
                >
                  {copyStatus === 'copied'
                    ? 'コピーしました'
                    : copyStatus === 'error'
                      ? 'コピー失敗'
                      : 'クリップボードにコピー'}
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  ファイルをダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
