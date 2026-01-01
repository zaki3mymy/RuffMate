import { useState, useEffect } from 'react'

interface RuleToggleProps {
  ruleCode: string
}

export default function RuleToggle({ ruleCode }: RuleToggleProps) {
  const [enabled, setEnabled] = useState(true)
  const [comment, setComment] = useState('')

  // クライアントサイドでのみlocalStorage読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(`rule-${ruleCode}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setEnabled(data.enabled ?? true)
        setComment(data.comment ?? '')
      } catch (error) {
        console.error(`Failed to parse localStorage for ${ruleCode}:`, error)
      }
    }
  }, [ruleCode])

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `rule-${ruleCode}`,
        JSON.stringify({ enabled: newEnabled, comment })
      )
    }
  }

  const handleCommentChange = (value: string) => {
    setComment(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `rule-${ruleCode}`,
        JSON.stringify({ enabled, comment: value })
      )
    }
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
