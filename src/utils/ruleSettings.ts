// グローバルな設定ストア
interface RuleSettingData {
  enabled: boolean
  comment?: string
}

class RuleSettingsStore {
  private settings: Map<string, RuleSettingData> = new Map()
  private loaded = false

  // ページロード時に一度だけ全設定を読み込む
  loadAll() {
    if (this.loaded || typeof window === 'undefined') return

    // localStorageから全てのrule-*キーを読み込む
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('rule-')) {
        try {
          const ruleCode = key.replace('rule-', '')
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          this.settings.set(ruleCode, data)
        } catch (error) {
          console.error(`Failed to parse settings for ${key}:`, error)
        }
      }
    }

    this.loaded = true
  }

  // 設定を取得
  get(ruleCode: string): RuleSettingData {
    return this.settings.get(ruleCode) || { enabled: true }
  }

  // 設定を保存
  set(ruleCode: string, data: RuleSettingData) {
    this.settings.set(ruleCode, data)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`rule-${ruleCode}`, JSON.stringify(data))
    }
  }
}

// グローバルインスタンス
export const ruleSettingsStore = new RuleSettingsStore()

// ブラウザ環境でのみ自動ロード
if (typeof window !== 'undefined') {
  ruleSettingsStore.loadAll()
}
