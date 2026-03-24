import { useParams, Link } from 'react-router-dom'
import { getMetricById, metricsData } from '../../data/metricsGuideData'

export default function MetricDetailPage() {
  const { metricId } = useParams()
  const metric = getMetricById(metricId)

  if (!metric) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-700">지표를 찾을 수 없습니다</h1>
      <Link to="/metrics-guide" className="mt-4 inline-block text-blue-600 hover:underline">← 재무지표 사전으로 돌아가기</Link>
    </div>
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">›</span>
        <Link to="/metrics-guide" className="hover:text-blue-600">재무지표 사전</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{metric.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#0f3460' }}>{metric.fullName}</h1>
        </div>
        <p className="text-gray-600 text-lg">{metric.summary}</p>
      </header>

      {/* Formula box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">계산식</h2>
        <p className="text-2xl font-bold text-blue-900 font-mono">{metric.formula}</p>
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>상세 설명</h2>
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {metric.description}
        </div>
      </section>

      {/* Interpretation */}
      {metric.interpretation && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>해석 기준</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(metric.interpretation).map((item, i) => (
              <div key={i} className={`rounded-xl p-4 ${
                item.color === 'green' ? 'bg-green-50 border border-green-200' :
                item.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-bold text-sm mb-1 ${
                  item.color === 'green' ? 'text-green-700' :
                  item.color === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                }`}>{item.label}</div>
                <div className="text-xs font-mono mb-2 opacity-70">{item.range}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sector benchmark */}
      {metric.sectorBenchmark && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>업종별 평균 ({metric.name})</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">업종</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">평균값</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metric.sectorBenchmark.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">{row.sector}</td>
                    <td className="px-6 py-3 text-sm font-bold text-right" style={{ color: '#0f3460' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tips */}
      {metric.tips && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>투자 활용 팁</h2>
          <ul className="space-y-3">
            {metric.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-4">
                <span className="text-yellow-500 font-bold text-lg">💡</span>
                <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related metrics */}
      {metric.relatedMetrics && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>연관 지표</h2>
          <div className="flex flex-wrap gap-3">
            {metric.relatedMetrics.map(id => {
              const rel = metricsData.find(m => m.id === id)
              return rel ? (
                <Link key={id} to={`/metrics-guide/${id}`}
                  className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                  style={{ color: '#0f3460' }}
                >{rel.name}</Link>
              ) : null
            })}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="pt-6 border-t border-gray-200">
        <Link to="/metrics-guide" className="text-sm hover:underline" style={{ color: '#0f3460' }}>
          ← 재무지표 사전 전체 목록으로
        </Link>
      </div>
    </main>
  )
}
