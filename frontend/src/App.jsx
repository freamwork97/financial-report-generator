import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import MetricsGuideIndexPage from './pages/metrics-guide/MetricsGuideIndexPage'
import MetricDetailPage from './pages/metrics-guide/MetricDetailPage'
import SectorGuideIndexPage from './pages/sector-guide/SectorGuideIndexPage'
import SectorDetailPage from './pages/sector-guide/SectorDetailPage'
import CompanyCasesIndexPage from './pages/company-cases/CompanyCasesIndexPage'
import CompanyCaseDetailPage from './pages/company-cases/CompanyCaseDetailPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { getMetrics, streamAnalysis, downloadPdf, searchCompany } from './api'
import { applySeoMetaToDocument, getSeoMeta } from './seoMeta'

// 광고 허용: 목록(index) 페이지 제외, 상세(detail) 페이지만 허용
const ADSENSE_ALLOWED_PREFIXES = ['/metrics-guide/', '/sector-guide/', '/company-cases/']

function AdSenseLoader() {
  const { pathname } = useLocation()
  const isAllowed = ADSENSE_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  useEffect(() => {
    if (!isAllowed) return
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5381965531835429'
    script.async = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [isAllowed])
  return null
}

function SeoMetaUpdater() {
  const { pathname } = useLocation()

  useEffect(() => {
    applySeoMetaToDocument(getSeoMeta(pathname))
  }, [pathname])

  return null
}

function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
        <span>© {new Date().getFullYear()} 재무제표 분석 리포트 생성기</span>
        <span>·</span>
        <Link to="/about" className="hover:text-gray-700 underline">서비스 소개</Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-gray-700 underline">문의하기</Link>
        <span>·</span>
        <Link to="/privacy-policy" className="hover:text-gray-700 underline">
          개인정보처리방침
        </Link>
      </div>
    </footer>
  )
}

export function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
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
      navigate('/results')
    } catch (err) {
      setError('재무 데이터 조회 실패: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  useEffect(() => {
    const autoAnalyze = location.state?.autoAnalyze
    if (!autoAnalyze) return
    window.history.replaceState({}, '')

    // 하드코딩된 corpCode 대신 DART 검색으로 실제 corp_code를 가져옴
    searchCompany(autoAnalyze.company_name)
      .then((res) => {
        const results = res.data.results || []
        const exactMatch = results.find((c) => c.corp_name === autoAnalyze.company_name)
        const listedMatch = results.find((c) => c.stock_code)
        const best = exactMatch || listedMatch || results[0]
        handleSelect(best
          ? { ...autoAnalyze, corp_code: best.corp_code, company_name: best.corp_name }
          : autoAnalyze
        )
      })
      .catch(() => handleSelect(autoAnalyze))
  }, [location.state])

  const handleBack = () => {
    navigate('/')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoMetaUpdater />
      <AdSenseLoader />
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <SearchPage
              onSelect={handleSelect}
              isLoading={isLoadingMetrics}
              error={error}
            />
          }
        />
        <Route
          path="/results"
          element={
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
          }
        />
        <Route path="/metrics-guide" element={<MetricsGuideIndexPage />} />
        <Route path="/metrics-guide/:metricId" element={<MetricDetailPage />} />
        <Route path="/sector-guide" element={<SectorGuideIndexPage />} />
        <Route path="/sector-guide/:sectorId" element={<SectorDetailPage />} />
        <Route path="/company-cases" element={<CompanyCasesIndexPage />} />
        <Route path="/company-cases/:companyId" element={<CompanyCaseDetailPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
