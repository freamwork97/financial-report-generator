import SearchPanel from '../components/SearchPanel'

export default function SearchPage({ onSelect, isLoading, error }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">기업 재무 분석</h2>
        <p className="text-gray-500">회사명을 검색하고 AI 기반 재무제표 분석 리포트를 생성하세요</p>
      </div>

      <SearchPanel onSelect={onSelect} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <span className="ml-4 text-gray-500">재무 데이터 로딩 중...</span>
        </div>
      )}
    </main>
  )
}
