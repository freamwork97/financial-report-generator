export default function AnalysisPanel({ analysis, isLoading }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">AI 재무 분석</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-accent text-sm">
            <div className="animate-pulse w-2 h-2 rounded-full bg-accent" />
            <span>분석 중...</span>
          </div>
        )}
      </div>
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 bg-gray-50 rounded-lg p-4">
          {analysis}
          {isLoading && <span className="animate-pulse">▌</span>}
        </pre>
      </div>
    </div>
  )
}
