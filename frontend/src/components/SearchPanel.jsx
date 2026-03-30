import { useState } from 'react'
import { searchCompany } from '../api'

const CURRENT_YEAR = new Date().getFullYear()

export default function SearchPanel({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [year, setYear] = useState(CURRENT_YEAR - 1)
  const [reportCode, setReportCode] = useState('11011')
  const [stockCode, setStockCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await searchCompany(query)
      const results = res.data.results || []
      setResults(results)
      if (results.length === 0) {
        setError('검색 결과가 없습니다. 회사명을 다시 확인해주세요.')
      }
    } catch {
      setResults([])
      setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (company) => {
    const sc = stockCode || (company.stock_code ? `${company.stock_code}.KS` : '')
    onSelect({
      corp_code: company.corp_code,
      stock_code: sc,
      company_name: company.corp_name,
      year,
      report_code: reportCode,
    })
    setResults([])
    setQuery(company.corp_name)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-primary mb-4">기업 검색</h2>
      <div className="flex gap-3 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="회사명 검색 (예: 삼성전자)"
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value)}
          placeholder="종목코드 (예: 005930.KS)"
          className="w-48 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {[CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3, CURRENT_YEAR - 4].map(y => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          value={reportCode}
          onChange={(e) => setReportCode(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="11011">연간 (사업보고서)</option>
          <option value="11013">1분기</option>
          <option value="11012">반기 (2분기)</option>
          <option value="11014">3분기</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-primary hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          {results.map((company) => (
            <button
              key={company.corp_code}
              onClick={() => handleSelect(company)}
              className="w-full text-left px-4 py-3 hover:bg-surface transition-colors border-b border-gray-100 last:border-0"
            >
              <span className="font-semibold text-primary">{company.corp_name}</span>
              {company.stock_code && (
                <span className="ml-2 text-sm text-gray-500">({company.stock_code})</span>
              )}
              {company.modify_date && (
                <span className="ml-2 text-xs text-gray-400">{company.modify_date}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
