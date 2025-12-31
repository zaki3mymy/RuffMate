function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            RuffMate
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ruff設定管理ツール
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-700">
            プロジェクトセットアップ中...
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
