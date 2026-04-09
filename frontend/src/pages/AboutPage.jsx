export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#0f3460' }}>서비스 소개</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>재무제표 분석 리포트 생성기란?</h2>
        <p className="text-gray-700 leading-relaxed">
          본 서비스는 DART(전자공시시스템) 공개 데이터를 기반으로 국내 상장기업의 재무제표를 자동으로 수집·분석하여
          누구나 쉽게 이해할 수 있는 리포트를 제공하는 투자 교육 플랫폼입니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>주요 기능</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
          <li>
            <strong>기업 재무 분석</strong> — PER, PBR, ROE, 부채비율 등 핵심 재무지표를 자동으로 계산하고 시각화합니다.
          </li>
          <li>
            <strong>AI 분석 리포트</strong> — Claude AI가 재무 데이터를 해석하여 투자 포인트와 리스크를 요약합니다.
          </li>
          <li>
            <strong>재무지표 사전</strong> — PER, EV/EBITDA 등 30여 개 재무지표의 의미, 계산 방법, 업종별 기준값을 안내합니다.
          </li>
          <li>
            <strong>업종별 투자 가이드</strong> — 반도체, 바이오, 금융 등 6개 주요 업종의 특성과 분석 방법을 설명합니다.
          </li>
          <li>
            <strong>기업 사례집</strong> — 삼성전자, SK하이닉스 등 주요 기업의 재무 특성과 투자 포인트를 학습합니다.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>데이터 출처</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
          <li>금융감독원 DART 전자공시시스템 (dart.fss.or.kr) — 사업보고서, 재무제표 공시</li>
          <li>Yahoo Finance — 주가 데이터, 시가총액, 시장 지표</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>유의사항</h2>
        <p className="text-gray-700 leading-relaxed">
          본 서비스에서 제공하는 모든 분석 내용은 <strong>교육 및 정보 제공 목적</strong>으로만 활용되어야 하며,
          투자 권유나 금융 조언이 아닙니다. 실제 투자 결정은 본인의 판단과 책임 하에 이루어져야 하며,
          전문 금융 투자 상담사와 상의하시기 바랍니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>기술 스택</h2>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="bg-blue-50 rounded p-3">
            <div className="font-medium text-blue-800 mb-1">Frontend</div>
            <div>React 18, Recharts, TailwindCSS</div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="font-medium text-green-800 mb-1">Backend</div>
            <div>Python, FastAPI, pandas</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="font-medium text-purple-800 mb-1">AI 분석</div>
            <div>Anthropic Claude API</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="font-medium text-orange-800 mb-1">배포</div>
            <div>Vercel (Frontend) / Railway (Backend)</div>
          </div>
        </div>
      </section>
    </div>
  )
}
