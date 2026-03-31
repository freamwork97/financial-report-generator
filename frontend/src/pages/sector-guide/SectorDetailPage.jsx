import { useParams, Link, Navigate } from 'react-router-dom'
import { getSectorById } from '../../data/sectorGuideData'

const importanceColors = {
  HIGH: 'bg-red-100 text-red-700',
  MED: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
}

export default function SectorDetailPage() {
  const { sectorId } = useParams()
  const sector = getSectorById(sectorId)

  if (!sector) return <Navigate to="/sector-guide" replace />

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">›</span>
        <Link to="/sector-guide" className="hover:text-blue-600">업종별 가이드</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{sector.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{sector.icon}</span>
          <h1 className="text-3xl font-bold" style={{ color: '#0f3460' }}>{sector.name} 업종 분석 가이드</h1>
        </div>
        <p className="text-gray-600 text-lg">{sector.summary}</p>
      </header>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>업종 특성</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700 leading-relaxed whitespace-pre-line">
          {sector.description}
        </div>
      </section>

      {/* Key metrics table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>핵심 분석 지표</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">지표</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">중요도</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">이 업종에서 중요한 이유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sector.keyMetrics.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: '#0f3460' }}>{m.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${importanceColors[m.importance]}`}>{m.importance}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 leading-relaxed">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analysis flow */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>분석 순서 (How-to)</h2>
        <div className="space-y-3">
          {sector.analysisFlow.map((step, i) => (
            <div key={i} className="flex items-start gap-4 bg-white border border-gray-100 rounded-lg p-4">
              <span className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0f3460' }}>{i + 1}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pitfalls */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>⚠️ 분석 시 주의점</h2>
        <div className="space-y-3">
          {sector.pitfalls.map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-4">
              <span className="text-red-500 font-bold">!</span>
              <p className="text-sm text-red-800 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample companies */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>대표 기업</h2>
        <div className="flex flex-wrap gap-3">
          {sector.sampleCompanies.map(co => (
            <span key={co} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">{co}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h3 className="font-bold mb-2" style={{ color: '#0f3460' }}>직접 분석해보세요</h3>
        <p className="text-sm text-gray-600 mb-4">위 기업들의 실제 재무 데이터를 AI로 분석해보세요</p>
        <Link to="/" className="inline-block text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#e94560' }}>
          기업 분석 시작하기 →
        </Link>
      </div>

      <div className="pt-6 border-t border-gray-200 mt-6">
        <Link to="/sector-guide" className="text-sm hover:underline" style={{ color: '#0f3460' }}>← 업종별 가이드 전체 목록으로</Link>
      </div>
    </main>
  )
}
