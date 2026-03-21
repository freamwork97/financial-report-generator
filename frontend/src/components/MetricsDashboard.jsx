import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

function MetricCard({ label, value, unit = '', color = 'text-primary' }) {
  if (value == null) return null
  return (
    <div className="bg-surface rounded-xl p-4 border-l-4 border-primary">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
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
          <MetricCard label="EBITDA" value={metrics.ebitda} unit="억원" />
          <MetricCard label="영업이익률" value={metrics.operating_margin} unit="%" color={rateColor(metrics.operating_margin)} />
          <MetricCard label="ROE" value={metrics.roe} unit="%" color={rateColor(metrics.roe)} />
          <MetricCard label="부채비율" value={metrics.debt_to_equity} unit="%" color={debtColor(metrics.debt_to_equity)} />
          <MetricCard label="유동비율" value={metrics.current_ratio} unit="%" color={rateColor(metrics.current_ratio, 100)} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
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

        {/* Radar chart */}
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
                {[
                  ['매출총이익률', metrics.gross_margin, '%'],
                  ['영업이익률', metrics.operating_margin, '%'],
                  ['순이익률', metrics.net_margin, '%'],
                  ['ROA', metrics.roa, '%'],
                  ['EBITDA 마진', metrics.ebitda_margin, '%'],
                ].map(([label, val, unit]) => val != null && (
                  <tr key={label}>
                    <td className="py-1 text-gray-600">{label}</td>
                    <td className="py-1 font-semibold text-right">{fmt(val)}{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">안정성</h4>
            <table className="w-full">
              <tbody>
                {[
                  ['유동비율', metrics.current_ratio, '%'],
                  ['당좌비율', metrics.quick_ratio, '%'],
                  ['부채비율', metrics.debt_to_equity, '%'],
                  ['이자보상배율', metrics.interest_coverage, '배'],
                  ['자산대비부채', metrics.debt_ratio, '%'],
                ].map(([label, val, unit]) => val != null && (
                  <tr key={label}>
                    <td className="py-1 text-gray-600">{label}</td>
                    <td className="py-1 font-semibold text-right">{fmt(val)}{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">성장성</h4>
            <table className="w-full">
              <tbody>
                {[
                  ['매출 성장률', metrics.revenue_growth, '%'],
                  ['영업이익 성장률', metrics.operating_profit_growth, '%'],
                  ['순이익 성장률', metrics.net_profit_growth, '%'],
                  ['자산 성장률', metrics.asset_growth, '%'],
                  ['자산회전율', metrics.asset_turnover, '회'],
                ].map(([label, val, unit]) => val != null && (
                  <tr key={label}>
                    <td className="py-1 text-gray-600">{label}</td>
                    <td className={`py-1 font-semibold text-right ${val > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {val > 0 ? '+' : ''}{fmt(val)}{unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market data */}
        {marketData && Object.keys(marketData).length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-gray-600 mb-2">시장 지표</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              {marketData.pe_ratio > 0 && <span>PER <strong>{marketData.pe_ratio}배</strong></span>}
              {marketData.pb_ratio > 0 && <span>PBR <strong>{marketData.pb_ratio}배</strong></span>}
              {marketData.ps_ratio > 0 && <span>PSR <strong>{marketData.ps_ratio}배</strong></span>}
              {marketData.ev_ebitda > 0 && <span>EV/EBITDA <strong>{marketData.ev_ebitda}배</strong></span>}
              {marketData.dividend_yield > 0 && <span>배당수익률 <strong>{marketData.dividend_yield}%</strong></span>}
              {marketData.beta !== 0 && <span>베타 <strong>{marketData.beta}</strong></span>}
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
