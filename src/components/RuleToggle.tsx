import { useState, useEffect } from 'react'
import { ruleSettingsStore } from '../utils/ruleSettings'

interface RuleToggleProps {
  ruleCode: string
}

export default function RuleToggle({ ruleCode }: RuleToggleProps) {
  // 初期値はデフォルト（キャッシュから同期取得）
  const initialSettings =
    typeof window !== 'undefined'
      ? ruleSettingsStore.getSync(ruleCode)
      : { enabled: true, comment: '' }

  const [enabled, setEnabled] = useState(initialSettings.enabled)
  const [comment, setComment] = useState(initialSettings.comment || '')

  // マウント時に非同期でlocalStorageから読み込み（バッチ処理）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ruleSettingsStore.load(ruleCode, (data) => {
        setEnabled(data.enabled)
        setComment(data.comment || '')
      })
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
    <div className="flex-shrink-0 flex flex-col items-end gap-2">
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
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  )
}
