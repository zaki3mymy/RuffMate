import { describe, it, expect, vi } from 'vitest'
import { ruleSettingsStore } from '../src/utils/ruleSettings'

describe('RuleSettingsStore', () => {
  describe('getSync', () => {
    it('キャッシュにない場合はデフォルト値を返す', () => {
      const result = ruleSettingsStore.getSync('E501')
      expect(result).toEqual({ enabled: true })
    })

    it('キャッシュにある場合はキャッシュから返す', async () => {
      // まずloadでキャッシュに入れる
      await new Promise<void>((resolve) => {
        ruleSettingsStore.load('E501', (data) => {
          expect(data.enabled).toBe(true)
          resolve()
        })
      })

      // getSyncで取得
      const result = ruleSettingsStore.getSync('E501')
      expect(result).toEqual({ enabled: true })
    })
  })

  describe('load', () => {
    it('localStorageに保存されていない場合はデフォルト値を返す', async () => {
      const callback = vi.fn()

      await new Promise<void>((resolve) => {
        ruleSettingsStore.load('E501', (data) => {
          callback(data)
          resolve()
        })
      })

      // requestAnimationFrameをフラッシュ
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith({ enabled: true })
      })
    })

    it('localStorageに保存されている場合はその値を返す', async () => {
      // 事前にlocalStorageに保存
      localStorage.setItem(
        'rule-E501',
        JSON.stringify({ enabled: false, comment: 'テスト除外理由' })
      )

      const callback = vi.fn()

      await new Promise<void>((resolve) => {
        ruleSettingsStore.load('E501', (data) => {
          callback(data)
          resolve()
        })
      })

      await vi.waitFor(
        () => {
          expect(callback).toHaveBeenCalledWith({
            enabled: false,
            comment: 'テスト除外理由',
          })
        },
        { timeout: 2000 }
      )
    })

    it('既にキャッシュにある場合は即座にコールバックを呼ぶ', async () => {
      // 一度読み込んでキャッシュに入れる
      await new Promise<void>((resolve) => {
        ruleSettingsStore.load('E501', () => resolve())
      })

      // 2回目は即座に返るはず
      const callback = vi.fn()
      await ruleSettingsStore.load('E501', callback)

      expect(callback).toHaveBeenCalledWith({ enabled: true })
    })

    it('複数のルールを並列にロードした場合、バッチ処理される', async () => {
      const callbacks: Array<{
        code: string
        callback: ReturnType<typeof vi.fn>
      }> = []

      // 100個のルールを並列ロード
      const promises = Array.from({ length: 100 }, (_, i) => {
        const code = `E${i}`
        const callback = vi.fn()
        callbacks.push({ code, callback })

        return new Promise<void>((resolve) => {
          ruleSettingsStore.load(code, (data) => {
            callback(data)
            resolve()
          })
        })
      })

      await Promise.all(promises)

      // 全てのコールバックが呼ばれたことを確認
      callbacks.forEach(({ callback }) => {
        expect(callback).toHaveBeenCalledWith({ enabled: true })
      })
    })
  })

  describe('set', () => {
    it('localStorageに保存される', () => {
      ruleSettingsStore.set('E501', { enabled: false, comment: 'テスト' })

      const stored = window.localStorage.getItem('rule-E501')
      expect(stored).toBe(JSON.stringify({ enabled: false, comment: 'テスト' }))
    })

    it('キャッシュも更新される', async () => {
      // 保存
      ruleSettingsStore.set('E501', { enabled: false, comment: 'テスト' })

      // getSyncで即座に取得できる
      const result = ruleSettingsStore.getSync('E501')
      expect(result).toEqual({ enabled: false, comment: 'テスト' })
    })

    it('保存後にloadを呼んでも正しい値が返る', async () => {
      // 保存
      ruleSettingsStore.set('E501', { enabled: false, comment: 'テスト' })

      // loadで取得
      const callback = vi.fn()
      await ruleSettingsStore.load('E501', callback)

      expect(callback).toHaveBeenCalledWith({
        enabled: false,
        comment: 'テスト',
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('localStorageの読み込みに失敗した場合はデフォルト値を返す', async () => {
      // 不正なJSONを保存
      localStorage.setItem('rule-E501', 'invalid json')

      const callback = vi.fn()
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await new Promise<void>((resolve) => {
        ruleSettingsStore.load('E501', (data) => {
          callback(data)
          resolve()
        })
      })

      await vi.waitFor(
        () => {
          expect(callback).toHaveBeenCalledWith({ enabled: true })
          expect(consoleErrorSpy).toHaveBeenCalled()
        },
        { timeout: 2000 }
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
