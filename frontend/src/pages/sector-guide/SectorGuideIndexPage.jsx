import { Link } from 'react-router-dom'
import { sectorsData } from '../../data/sectorGuideData'

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
}

export default function SectorGuideIndexPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f3460' }}>업종별 분석 가이드</h1>
        <p className="text-gray-600 text-lg">업종마다 중요한 재무지표가 다릅니다. 반도체, 은행, 바이오 등 업종별 핵심 분석 방법을 알아보세요.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectorsData.map(sector => {
          const colors = colorMap[sector.color] || colorMap.blue
          return (
            <article key={sector.id}>
              <Link to={`/sector-guide/${sector.id}`}
                className={`block rounded-xl border p-6 hover:shadow-md transition-all h-full ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{sector.icon}</span>
                  <h2 className={`text-xl font-bold ${colors.text}`}>{sector.name}</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{sector.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {sector.sampleCompanies.slice(0, 3).map(co => (
                    <span key={co} className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>{co}</span>
                  ))}
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </main>
  )
}
