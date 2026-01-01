// グローバルな設定ストア
interface RuleSettingData {
  enabled: boolean
  comment?: string
}

type LoadCallback = (data: RuleSettingData) => void

class RuleSettingsStore {
  private cache: Map<string, RuleSettingData> = new Map()
  private loadQueue: Array<{ ruleCode: string; callback: LoadCallback }> = []
  private isProcessing = false
  private readonly BATCH_SIZE = 50 // 50個ずつ処理
  private readonly BATCH_DELAY = 16 // 16ms間隔（1フレーム）

  // 同期取得（キャッシュのみ、localStorageは読まない）
  getSync(ruleCode: string): RuleSettingData {
    if (this.cache.has(ruleCode)) {
      return this.cache.get(ruleCode)!
    }
    // デフォルト値を返す（まだ読み込まれていない）
    return { enabled: true }
  }

  // 同期取得（キャッシュ + localStorage）
  getSyncWithStorage(ruleCode: string): RuleSettingData {
    // キャッシュにあれば即座に返す
    if (this.cache.has(ruleCode)) {
      return this.cache.get(ruleCode)!
    }

    // localStorageから同期で読み込み
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`rule-${ruleCode}`)
        if (stored) {
          const data = JSON.parse(stored)
          this.cache.set(ruleCode, data)
          return data
        }
      } catch (error) {
        console.error(`Failed to load ${ruleCode}:`, error)
      }
    }

    // デフォルト値を返してキャッシュに保存
    const defaultValue = { enabled: true }
    this.cache.set(ruleCode, defaultValue)
    return defaultValue
  }

  // 非同期読み込み（キューに追加してバッチ処理）
  async load(ruleCode: string, callback: LoadCallback): Promise<void> {
    // 既にキャッシュにあれば即座にコールバック
    if (this.cache.has(ruleCode)) {
      callback(this.cache.get(ruleCode)!)
      return
    }

    // キューに追加
    this.loadQueue.push({ ruleCode, callback })

    // バッチ処理開始
    if (!this.isProcessing) {
      this.processBatch()
    }
  }

  private processBatch() {
    if (this.loadQueue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true

    // 次のフレームで処理
    requestAnimationFrame(() => {
      const batch = this.loadQueue.splice(0, this.BATCH_SIZE)

      // バッチ内の全てのルールをlocalStorageから読み込み
      for (const { ruleCode, callback } of batch) {
        let data: RuleSettingData

        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(`rule-${ruleCode}`)
            if (stored) {
              data = JSON.parse(stored)
              this.cache.set(ruleCode, data)
            } else {
              data = { enabled: true }
              this.cache.set(ruleCode, data)
            }
          } catch (error) {
            console.error(`Failed to load ${ruleCode}:`, error)
            data = { enabled: true }
            this.cache.set(ruleCode, data)
          }
        } else {
          data = { enabled: true }
        }

        callback(data)
      }

      // 次のバッチを処理（遅延を入れる）
      if (this.loadQueue.length > 0) {
        setTimeout(() => this.processBatch(), this.BATCH_DELAY)
      } else {
        this.isProcessing = false
      }
    })
  }

  // 設定を保存（キャッシュも更新）
  set(ruleCode: string, data: RuleSettingData) {
    this.cache.set(ruleCode, data)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`rule-${ruleCode}`, JSON.stringify(data))
    }
  }

  // テスト用: キャッシュをクリア
  clearCache() {
    this.cache.clear()
    this.loadQueue = []
    this.isProcessing = false
  }
}

// グローバルインスタンス
export const ruleSettingsStore = new RuleSettingsStore()
