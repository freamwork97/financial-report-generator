import { useState } from 'react'
import { Link } from 'react-router-dom'
import { companyCasesData } from '../../data/companyCasesData'

const sectors = [
  { id: 'all', label: '전체' },
  { id: 'semiconductor', label: '반도체' },
  { id: 'ev-battery', label: '2차전지' },
  { id: 'bio', label: '바이오' },
  { id: 'auto', label: '자동차' },
  { id: 'finance', label: '금융' },
  { id: 'platform', label: '플랫폼' },
  { id: 'steel', label: '철강/화학' },
]

export default function CompanyCasesIndexPage() {
  const [activeSector, setActiveSector] = useState('all')
  const filtered = activeSector === 'all'
    ? companyCasesData
    : companyCasesData.filter(c => c.sector === activeSector || (activeSector === 'steel' && (c.sector === 'steel' || c.sector === 'chemical')))

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f3460' }}>기업 분석 사례집</h1>
        <p className="text-gray-600 text-lg">코스피 대형주 주요 기업들의 재무 분석 사례를 확인하세요.</p>
      </section>

      {/* Sector filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sectors.map(s => (
          <button key={s.id} onClick={() => setActiveSector(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSector === s.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={activeSector === s.id ? { backgroundColor: '#0f3460' } : {}}
          >{s.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(company => (
          <article key={company.id}>
            <Link to={`/company-cases/${company.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#0f3460' }}>{company.name}</h2>
                  <span className="text-xs text-gray-400">{company.stockCode} · {company.exchange}</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{company.sectorLabel}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">시가총액 {company.marketCap}</p>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {company.businessOverview.substring(0, 100)}...
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>영업이익률 {company.financialHighlights.operatingMargin}</span>
                <span>ROE {company.financialHighlights.roe}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
