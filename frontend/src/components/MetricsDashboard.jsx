import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { metricsData } from '../data/metricsGuideData'

// id → { summary } 룩업 맵
const guideMap = Object.fromEntries(metricsData.map(m => [m.id, m]))

function MetricTooltip({ guideId }) {
  const [show, setShow] = useState(false)
  const guide = guideMap[guideId]
  if (!guide) return null

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        className="text-gray-300 hover:text-blue-400 transition-colors leading-none"
        aria-label={`${guide.name} 설명 보기`}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-3a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 012 0v3a1 1 0 01-2 0v-3z" />
        </svg>
      </button>
      {show && (
        <>
          {/* 버튼과 툴팁 사이 갭을 채우는 투명 브릿지 */}
          <div className="absolute" style={{ bottom: '100%', left: '-30px', right: '-30px', height: '8px' }} />
          <div
            className="absolute z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-left"
            style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="text-xs font-semibold text-gray-800 mb-1">{guide.name}</div>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">{guide.summary}</p>
            <Link
              to={`/metrics-guide/${guide.id}`}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              자세히 보기 →
            </Link>
            {/* 말풍선 꼬리 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #e5e7eb' }} />
          </div>
        </>
      )}
    </span>
  )
}

function MetricCard({ label, value, unit = '', color = 'text-primary', guideId }) {
  if (value == null) return null
  return (
    <div className="bg-surface rounded-xl p-4 border-l-4 border-primary">
      <div className="text-xs text-gray-500 mb-1 flex items-center">
        {label}
        <MetricTooltip guideId={guideId} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  )
}

function TableRow({ label, value, unit, color, guideId }) {
  if (value == null) return null
  return (
    <tr>
      <td className="py-1 text-gray-600">
        <span className="inline-flex items-center gap-0.5">
          {label}
          <MetricTooltip guideId={guideId} />
        </span>
      </td>
      <td className={`py-1 font-semibold text-right ${color || ''}`}>
        {fmt(value)}{unit}
      </td>
    </tr>
  )
}

export default function MetricsDashboard({ metrics, marketData }) {
  if (!metrics) return null

  const profitData = [
    { name: '매출액', value: metrics.revenue },
    { name: '영업이익', value: metrics.operating_profit },
    { name: '순이익', value: metrics.net_profit },
    { name: 'EBITDA', value: metrics.ebitda },
  ].filter(d => d.value != null)

  const radarData = [
    { subject: '수익성', value: clamp(metrics.operating_margin, 0, 30) / 30 * 100 },
    { subject: '성장성', value: clamp(metrics.revenue_growth, -20, 50) / 50 * 100 },
    { subject: '안정성', value: clamp(200 - (metrics.debt_to_equity || 0), 0, 200) / 200 * 100 },
    { subject: 'ROE', value: clamp(metrics.roe, 0, 30) / 30 * 100 },
    { subject: '유동성', value: clamp(metrics.current_ratio, 0, 300) / 300 * 100 },
  ]

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-primary mb-4">핵심 재무 지표</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="매출액" value={metrics.revenue} unit="억원" />
          <MetricCard label="영업이익" value={metrics.operating_profit} unit="억원" />
          <MetricCard label="당기순이익" value={metrics.net_profit} unit="억원" />
          <MetricCard label="EBITDA" value={metrics.ebitda} unit="억원" guideId="ebitda" />
          <MetricCard label="영업이익률" value={metrics.operating_margin} unit="%" color={rateColor(metrics.operating_margin)} guideId="operating-margin" />
          <MetricCard label="ROE" value={metrics.roe} unit="%" color={rateColor(metrics.roe)} guideId="roe" />
          <MetricCard label="부채비율" value={metrics.debt_to_equity} unit="%" color={debtColor(metrics.debt_to_equity)} guideId="debt-ratio" />
          <MetricCard label="유동비율" value={metrics.current_ratio} unit="%" color={rateColor(metrics.current_ratio, 100)} guideId="current-ratio" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profitData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-primary mb-4">손익 현황 (억원)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v?.toLocaleString()}억원`]} />
                <Bar dataKey="value" fill="#0f3460" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-primary mb-4">재무 건전성 레이더</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="점수" dataKey="value" stroke="#e94560" fill="#e94560" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-primary mb-4">상세 지표</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">수익성</h4>
            <table className="w-full">
              <tbody>
                <TableRow label="매출총이익률" value={metrics.gross_margin} unit="%" />
                <TableRow label="영업이익률" value={metrics.operating_margin} unit="%" guideId="operating-margin" />
                <TableRow label="순이익률" value={metrics.net_margin} unit="%" guideId="net-margin" />
                <TableRow label="ROA" value={metrics.roa} unit="%" guideId="roa" />
                <TableRow label="EBITDA 마진" value={metrics.ebitda_margin} unit="%" guideId="ebitda" />
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">안정성</h4>
            <table className="w-full">
              <tbody>
                <TableRow label="유동비율" value={metrics.current_ratio} unit="%" guideId="current-ratio" />
                <TableRow label="당좌비율" value={metrics.quick_ratio} unit="%" />
                <TableRow label="부채비율" value={metrics.debt_to_equity} unit="%" guideId="debt-ratio" />
                <TableRow label="이자보상배율" value={metrics.interest_coverage} unit="배" guideId="interest-coverage" />
                <TableRow label="자산대비부채" value={metrics.debt_ratio} unit="%" />
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">성장성</h4>
            <table className="w-full">
              <tbody>
                <TableRow label="매출 성장률" value={metrics.revenue_growth} unit="%" guideId="revenue-growth"
                  color={metrics.revenue_growth > 0 ? 'text-green-600' : 'text-red-500'} />
                <TableRow label="영업이익 성장률" value={metrics.operating_profit_growth} unit="%"
                  color={metrics.operating_profit_growth > 0 ? 'text-green-600' : 'text-red-500'} />
                <TableRow label="순이익 성장률" value={metrics.net_profit_growth} unit="%"
                  color={metrics.net_profit_growth > 0 ? 'text-green-600' : 'text-red-500'} />
                <TableRow label="자산 성장률" value={metrics.asset_growth} unit="%"
                  color={metrics.asset_growth > 0 ? 'text-green-600' : 'text-red-500'} />
                <TableRow label="자산회전율" value={metrics.asset_turnover} unit="회" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Market data */}
        {marketData && Object.keys(marketData).length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-gray-600 mb-2">시장 지표</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              {marketData.pe_ratio > 0 && (
                <span className="inline-flex items-center gap-1">
                  PER <MetricTooltip guideId="per" /> <strong>{marketData.pe_ratio}배</strong>
                </span>
              )}
              {marketData.pb_ratio > 0 && (
                <span className="inline-flex items-center gap-1">
                  PBR <MetricTooltip guideId="pbr" /> <strong>{marketData.pb_ratio}배</strong>
                </span>
              )}
              {marketData.ps_ratio > 0 && <span>PSR <strong>{marketData.ps_ratio}배</strong></span>}
              {marketData.ev_ebitda > 0 && (
                <span className="inline-flex items-center gap-1">
                  EV/EBITDA <MetricTooltip guideId="ev-ebitda" /> <strong>{marketData.ev_ebitda}배</strong>
                </span>
              )}
              {marketData.dividend_yield > 0 && (
                <span className="inline-flex items-center gap-1">
                  배당수익률 <MetricTooltip guideId="dividend-yield" /> <strong>{marketData.dividend_yield}%</strong>
                </span>
              )}
              {marketData.beta !== 0 && (
                <span className="inline-flex items-center gap-1">
                  베타 <MetricTooltip guideId="beta" /> <strong>{marketData.beta}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function fmt(v) {
  if (v == null) return 'N/A'
  return v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

function clamp(v, min, max) {
  if (v == null) return 0
  return Math.min(Math.max(v, min), max)
}

function rateColor(v, threshold = 0) {
  if (v == null) return 'text-primary'
  return v >= threshold ? 'text-green-600' : 'text-red-500'
}

function debtColor(v) {
  if (v == null) return 'text-primary'
  return v < 100 ? 'text-green-600' : v < 200 ? 'text-yellow-600' : 'text-red-500'
}
