import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function PriceChart({ data, company }) {
  if (!data || data.length === 0) return null

  // Show only last 252 trading days (1 year)
  const chartData = data.slice(-252).map(d => ({
    date: d.date.slice(5), // MM-DD
    close: d.close,
    volume: d.volume,
  }))

  const minClose = Math.min(...chartData.map(d => d.close))
  const maxClose = Math.max(...chartData.map(d => d.close))

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-primary mb-4">{company} 주가 추이 (1년)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            domain={[minClose * 0.95, maxClose * 1.05]}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip
            formatter={(v) => [`${v.toLocaleString()}원`, '종가']}
            labelFormatter={(l) => `날짜: ${l}`}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#0f3460"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
