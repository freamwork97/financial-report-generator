import { useState } from 'react'
import { Link } from 'react-router-dom'
import { metricsData } from '../../data/metricsGuideData'

const categories = ['전체', '가치평가', '수익성', '안정성', '성장성', '배당']

const categoryColors = {
  '가치평가': 'bg-blue-100 text-blue-800',
  '수익성': 'bg-green-100 text-green-800',
  '안정성': 'bg-purple-100 text-purple-800',
  '성장성': 'bg-orange-100 text-orange-800',
  '배당': 'bg-yellow-100 text-yellow-800',
}

export default function MetricsGuideIndexPage() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const filtered = activeCategory === '전체' ? metricsData : metricsData.filter(m => m.category === activeCategory)

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f3460' }}>재무지표 사전</h1>
        <p className="text-gray-600 text-lg">PER, ROE, EV/EBITDA 등 주식 투자에 필요한 핵심 재무지표를 쉽게 이해하세요.</p>
      </section>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={activeCategory === cat ? { backgroundColor: '#0f3460' } : {}}
          >{cat}</button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(metric => (
          <article key={metric.id}>
            <Link to={`/metrics-guide/${metric.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold" style={{ color: '#0f3460' }}>{metric.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[metric.category]}`}>
                  {metric.category}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mb-3 bg-gray-50 px-2 py-1 rounded">{metric.formula}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{metric.summary}</p>
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
