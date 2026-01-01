import { useState, useEffect } from 'react'
import { ruleSettingsStore } from '../utils/ruleSettings'

interface RuleToggleProps {
  ruleCode: string
}

export default function RuleToggle({ ruleCode }: RuleToggleProps) {
  // グローバルストアから初期値を取得（同期処理）
  const initialSettings = typeof window !== 'undefined'
    ? ruleSettingsStore.get(ruleCode)
    : { enabled: true, comment: '' }

  const [enabled, setEnabled] = useState(initialSettings.enabled)
  const [comment, setComment] = useState(initialSettings.comment || '')

  // ハイドレーション後に念のため再チェック（通常は不要）
  useEffect(() => {
    if (typeof window === 'undefined') return

    const settings = ruleSettingsStore.get(ruleCode)
    if (settings.enabled !== enabled || settings.comment !== comment) {
      setEnabled(settings.enabled)
      setComment(settings.comment || '')
    }
  }, [ruleCode])

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    ruleSettingsStore.set(ruleCode, { enabled: newEnabled, comment })
  }

  const handleCommentChange = (value: string) => {
    setComment(value)
    ruleSettingsStore.set(ruleCode, { enabled, comment: value })
  }

  return (
    <div className="flex-shrink-0">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        aria-label={`${ruleCode}を${enabled ? '無効化' : '有効化'}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {!enabled && (
        <input
          type="text"
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          placeholder="除外理由"
          className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  )
}
