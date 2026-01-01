import { useState, useEffect } from 'react'
import { ruleSettingsStore } from '../utils/ruleSettings'

export default function ResetButton() {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [resetStatus, setResetStatus] = useState<
    'idle' | 'resetting' | 'success'
  >('idle')

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmModal && resetStatus === 'idle') {
        setShowConfirmModal(false)
      }
    }

    if (showConfirmModal) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showConfirmModal, resetStatus])

  const handleReset = () => {
    setResetStatus('resetting')

    try {
      // 設定をリセット
      ruleSettingsStore.clearAll()
      setResetStatus('success')

      // 成功イベントをdispatch（各コンポーネントが受け取って更新）
      window.dispatchEvent(
        new CustomEvent('settings-reset', {
          detail: { timestamp: Date.now() },
        })
      )

      // 1.5秒後にモーダルを閉じる
      setTimeout(() => {
        setShowConfirmModal(false)
        setResetStatus('idle')
      }, 1500)
    } catch (error) {
      console.error('Reset failed:', error)
      setResetStatus('idle')
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 md:w-auto"
        aria-label="設定をリセット"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        リセット
      </button>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={resetStatus === 'idle' ? handleCancel : undefined}
        >
          <div
            className="mx-4 max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                設定をリセット
              </h2>
            </div>

            {/* コンテンツ */}
            <div className="p-4 sm:p-6">
              {resetStatus === 'resetting' ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                  <p className="text-sm text-gray-600">リセット中...</p>
                </div>
              ) : resetStatus === 'success' ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">リセットしました</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    本当に全ての設定をリセットしますか？この操作は元に戻せません。
                  </p>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-xs text-red-700">
                      ルールの有効/無効、コメントなど全ての設定が初期状態に戻ります。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* フッター */}
            {resetStatus === 'idle' && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <button
                    onClick={handleCancel}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                  >
                    リセット
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
