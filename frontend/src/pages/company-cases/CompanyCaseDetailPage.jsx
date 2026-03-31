import { useParams, Link, useNavigate, Navigate } from 'react-router-dom'
import { getCompanyById, companyCasesData } from '../../data/companyCasesData'

export default function CompanyCaseDetailPage() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const company = getCompanyById(companyId)

  if (!company) return <Navigate to="/company-cases" replace />

  const highlights = company.financialHighlights

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">›</span>
        <Link to="/company-cases" className="hover:text-blue-600">기업 사례집</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{company.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#0f3460' }}>{company.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-mono">{company.stockCode}</span>
              <span>·</span>
              <span>{company.exchange}</span>
              <span>·</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{company.sectorLabel}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">시가총액 {company.marketCap}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
            style={{ backgroundColor: '#e94560' }}
          >
            실시간 AI 분석하기
          </button>
        </div>
      </header>

      {/* Business overview */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>사업 개요</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700 leading-relaxed whitespace-pre-line">
          {company.businessOverview}
        </div>
      </section>

      {/* Financial highlights */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>주요 재무 지표 ({highlights.year}년)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: '매출액', value: highlights.revenue },
            { label: '영업이익', value: highlights.operatingProfit },
            { label: '순이익', value: highlights.netProfit },
            { label: '영업이익률', value: highlights.operatingMargin },
            { label: 'ROE', value: highlights.roe },
            { label: '부채비율', value: highlights.debtRatio },
            { label: 'PER', value: highlights.per },
            { label: 'PBR', value: highlights.pbr },
            { label: '배당수익률', value: highlights.dividendYield },
          ].filter(item => item.value).map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-lg font-bold" style={{ color: '#0f3460' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths & Risks */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>투자 강점</h2>
            <ul className="space-y-3">
              {company.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-4">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>주요 리스크</h2>
            <ul className="space-y-3">
              {company.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-4">
                  <span className="text-red-500 font-bold flex-shrink-0">!</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Investment point */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>투자 포인트</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-gray-700 leading-relaxed">
          {company.investmentPoint}
        </div>
      </section>

      {/* Analyst note */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>밸류에이션 분석</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700 leading-relaxed">
          {company.analystNote}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-8 text-center text-white mb-8">
        <h3 className="text-xl font-bold mb-2">최신 데이터로 다시 분석해보세요</h3>
        <p className="text-blue-200 text-sm mb-6">DART 공시 데이터 기반 AI 재무 분석 리포트를 무료로 생성하세요</p>
        <button
          onClick={() => navigate('/')}
          className="bg-white font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: '#0f3460' }}
        >
          {company.name} 실시간 분석 시작 →
        </button>
      </div>

      {/* Other companies (same sector) */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>같은 업종 기업 보기</h2>
        <div className="flex flex-wrap gap-3">
          {companyCasesData
            .filter(c => c.sector === company.sector && c.id !== company.id)
            .map(c => (
              <Link key={c.id} to={`/company-cases/${c.id}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 transition-colors"
                style={{ color: '#0f3460' }}
              >
                {c.name}
              </Link>
            ))
          }
        </div>
      </section>

      <div className="pt-6 border-t border-gray-200">
        <Link to="/company-cases" className="text-sm hover:underline" style={{ color: '#0f3460' }}>← 기업 사례집 전체 목록으로</Link>
      </div>
    </main>
  )
}
