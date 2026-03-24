import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '기업 분석' },
  { path: '/metrics-guide', label: '재무지표 사전' },
  { path: '/sector-guide', label: '업종별 가이드' },
  { path: '/company-cases', label: '기업 사례집' },
]

export default function NavBar() {
  const location = useLocation()
  return (
    <nav style={{ backgroundColor: '#0f3460' }} className="text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white hover:text-gray-200">
          📊 재무제표 분석기
        </Link>
        <div className="flex gap-6">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-gray-300 ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'text-yellow-300 border-b-2 border-yellow-300 pb-1'
                  : 'text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
