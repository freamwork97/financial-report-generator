import { useState } from 'react'
import SearchPanel from './components/SearchPanel'
import MetricsDashboard from './components/MetricsDashboard'
import AnalysisPanel from './components/AnalysisPanel'
import PriceChart from './components/PriceChart'
import { getMetrics, streamAnalysis, downloadPdf } from './api'

export default function App() {
  const [selected, setSelected] = useState(null) // {corp_code, stock_code, company_name, year}
  const [metricsData, setMetricsData] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [error, setError] = useState(null)

  const handleSelect = async (company) => {
    setSelected(company)
    setMetricsData(null)
    setAnalysis('')
    setError(null)
    setIsLoadingMetrics(true)

    try {
      const res = await getMetrics(company)
      setMetricsData(res.data)
    } catch (err) {
      setError('재무 데이터 조회 실패: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const handleAnalyze = () => {
    if (!selected) return
    setAnalysis('')
    setIsLoadingAnalysis(true)
    streamAnalysis(
      selected,
      (chunk) => setAnalysis((prev) => prev + chunk),
      () => setIsLoadingAnalysis(false),
      (err) => { setError('분석 실패: ' + err.message); setIsLoadingAnalysis(false) }
    )
  }

  const handleDownloadPdf = async () => {
    if (!selected || !analysis) return
    setIsLoadingPdf(true)
    try {
      await downloadPdf(selected)
    } catch (err) {
      setError('PDF 생성 실패: ' + err.message)
    } finally {
      setIsLoadingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">재무제표 분석 리포트 생성기</h1>
            <p className="text-blue-200 text-sm mt-1">DART 공시 데이터 × Claude AI 분석</p>
          </div>
          {selected && metricsData && (
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoadingAnalysis}
                className="bg-accent hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {isLoadingAnalysis ? '분석 중...' : 'AI 분석 시작'}
              </button>
              {analysis && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={isLoadingPdf}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  {isLoadingPdf ? 'PDF 생성 중...' : 'PDF 다운로드'}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <SearchPanel onSelect={handleSelect} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoadingMetrics && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <span className="ml-4 text-gray-500">재무 데이터 로딩 중...</span>
          </div>
        )}

        {/* Dashboard */}
        {metricsData && (
          <>
            <MetricsDashboard metrics={metricsData.metrics} marketData={metricsData.market_data} />
            {metricsData.price_history?.length > 0 && (
              <PriceChart data={metricsData.price_history} company={selected?.company_name} />
            )}
          </>
        )}

        {/* Analysis */}
        {(analysis || isLoadingAnalysis) && (
          <AnalysisPanel analysis={analysis} isLoading={isLoadingAnalysis} />
        )}
      </main>
    </div>
  )
}
