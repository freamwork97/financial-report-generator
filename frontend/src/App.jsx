import { useState } from 'react'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import { getMetrics, streamAnalysis, downloadPdf } from './api'

export default function App() {
  const [page, setPage] = useState('search') // 'search' | 'results'
  const [selected, setSelected] = useState(null)
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
      setPage('results')
    } catch (err) {
      setError('재무 데이터 조회 실패: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const handleBack = () => {
    setPage('search')
    setSelected(null)
    setMetricsData(null)
    setAnalysis('')
    setError(null)
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

  if (page === 'results' && metricsData) {
    return (
      <ResultsPage
        selected={selected}
        metricsData={metricsData}
        analysis={analysis}
        isLoadingAnalysis={isLoadingAnalysis}
        isLoadingPdf={isLoadingPdf}
        error={error}
        onBack={handleBack}
        onAnalyze={handleAnalyze}
        onDownloadPdf={handleDownloadPdf}
      />
    )
  }

  return (
    <SearchPage
      onSelect={handleSelect}
      isLoading={isLoadingMetrics}
      error={error}
    />
  )
}
