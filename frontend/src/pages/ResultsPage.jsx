import { useEffect } from 'react'
import MetricsDashboard from '../components/MetricsDashboard'
import AnalysisPanel from '../components/AnalysisPanel'
import PriceChart from '../components/PriceChart'

export default function ResultsPage({
  selected,
  metricsData,
  analysis,
  isLoadingAnalysis,
  isLoadingPdf,
  error,
  onBack,
  onAnalyze,
  onDownloadPdf,
}) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5381965531835429'
    script.async = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-blue-200 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              ← 새로운 검색
            </button>
            <div>
              <h1 className="text-2xl font-bold">{selected?.company_name}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{selected?.year}년 재무제표 분석</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onAnalyze}
              disabled={isLoadingAnalysis}
              className="bg-accent hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {isLoadingAnalysis ? '분석 중...' : 'AI 분석 시작'}
            </button>
            {analysis && (
              <button
                onClick={onDownloadPdf}
                disabled={isLoadingPdf}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {isLoadingPdf ? 'PDF 생성 중...' : 'PDF 다운로드'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <MetricsDashboard metrics={metricsData.metrics} marketData={metricsData.market_data} />

        {metricsData.price_history?.length > 0 && (
          <PriceChart data={metricsData.price_history} company={selected?.company_name} />
        )}

        {(analysis || isLoadingAnalysis) && (
          <AnalysisPanel analysis={analysis} isLoading={isLoadingAnalysis} />
        )}
      </main>
    </div>
  )
}
