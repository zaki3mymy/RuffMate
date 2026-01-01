import { beforeEach, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { ruleSettingsStore } from '../src/utils/ruleSettings'

// localStorageのモックを各テストの前に設定
beforeEach(() => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      get length() {
        return Object.keys(store).length
      },
      key: (index: number) => Object.keys(store)[index] || null,
    }
  })()

  // グローバルに設定
  global.localStorage = localStorageMock as Storage
  ;(global as unknown as { window: { localStorage: Storage } }).window = {
    localStorage: localStorageMock,
  }

  // ruleSettingsStoreのキャッシュをクリア
  ruleSettingsStore.clearCache()
})

afterEach(() => {
  global.localStorage.clear()
  ruleSettingsStore.clearCache()
  vi.clearAllMocks()
})
