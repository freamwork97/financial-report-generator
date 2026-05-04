import SearchPanel from '../components/SearchPanel'

const FEATURES = [
  {
    title: '핵심 재무지표 자동 계산',
    desc: 'PER, PBR, ROE, EV/EBITDA, 부채비율, 영업이익률 등 30여 개 재무지표를 DART 공시 데이터를 기반으로 자동 계산하고 시각화합니다. 복잡한 계산 없이 원하는 기업의 재무 건전성을 한눈에 파악할 수 있습니다.',
  },
  {
    title: 'AI 기반 재무제표 해석',
    desc: 'Anthropic Claude AI가 계산된 재무 데이터를 해석하여 투자 포인트, 리스크 요인, 업종 내 경쟁력을 자연어로 요약합니다. 전문 애널리스트 수준의 분석을 누구나 쉽게 얻을 수 있습니다.',
  },
  {
    title: '재무지표 사전 (30+ 지표)',
    desc: 'PER부터 EV/EBITDA, FCF, 유동비율까지 주식 투자에 필요한 재무지표의 정의, 계산식, 해석 기준, 업종별 평균값을 체계적으로 정리했습니다. 지표 하나하나의 의미를 깊이 이해할 수 있습니다.',
  },
  {
    title: '업종별 투자 분석 가이드',
    desc: '반도체, 금융, 바이오, 유통, IT서비스, 건설 등 6개 주요 업종의 특성과 핵심 재무지표 분석 순서를 안내합니다. 업종마다 중요하게 봐야 할 지표가 다르며, 이 차이를 이해하는 것이 올바른 기업 분석의 출발점입니다.',
  },
  {
    title: '국내 주요 기업 사례 분석',
    desc: '삼성전자, SK하이닉스, 카카오, 셀트리온 등 국내 대표 상장기업 15곳의 사업 구조, 재무 특성, 투자 포인트, 리스크 요인을 사례 중심으로 정리했습니다. 실제 기업 데이터를 통해 재무 분석 역량을 키울 수 있습니다.',
  },
  {
    title: 'DART 공시 기반 신뢰할 수 있는 데이터',
    desc: '금융감독원 DART 전자공시시스템의 사업보고서와 Yahoo Finance 주가 데이터를 연동하여 최신 재무 정보를 제공합니다. 수작업 없이 공식 공시 데이터를 자동으로 수집·분석합니다.',
  },
]

const HOW_TO_USE = [
  { step: '1', title: '기업 검색', desc: '상단 검색창에 분석하려는 기업명을 입력하세요. DART에 등록된 국내 상장기업이라면 모두 검색 가능합니다.' },
  { step: '2', title: '재무지표 확인', desc: '자동으로 계산된 PER, PBR, ROE 등 핵심 재무지표와 최근 5년 주가 차트를 확인합니다.' },
  { step: '3', title: 'AI 분석 리포트 생성', desc: '\'AI 분석 시작\' 버튼을 클릭하면 Claude AI가 재무 데이터를 해석하여 투자 포인트와 리스크를 요약합니다.' },
]


export default function SearchPage({ onSelect, isLoading, error }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* 검색 영역 */}
      <section className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f3460' }}>기업 재무 분석</h1>
          <p className="text-gray-500">회사명을 검색하고 AI 기반 재무제표 분석 리포트를 생성하세요</p>
        </div>

        <SearchPanel onSelect={onSelect} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <span className="ml-4 text-gray-500">재무 데이터 로딩 중...</span>
          </div>
        )}
      </section>

      {/* 서비스 소개 */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0f3460' }}>재무제표 분석 리포트 생성기란?</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          재무제표 분석 리포트 생성기는 금융감독원 DART 전자공시시스템의 공개 데이터를 기반으로
          국내 상장기업의 재무제표를 자동으로 수집·분석하여 누구나 쉽게 이해할 수 있는 투자 분석 리포트를 제공하는 서비스입니다.
        </p>
        <p className="text-gray-700 leading-relaxed">
          주식 투자를 처음 시작하는 분부터 재무 분석 역량을 키우고 싶은 분까지,
          복잡한 재무제표를 직접 읽지 않아도 핵심 지표와 AI 해석을 통해 기업의 재무 건전성과 투자 매력도를 파악할 수 있습니다.
          단, 본 서비스의 모든 분석 내용은 <strong>교육 및 정보 제공 목적</strong>으로만 활용되어야 하며 투자 권유가 아닙니다.
        </p>
      </section>

      {/* 주요 기능 */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6" style={{ color: '#0f3460' }}>주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-base mb-2" style={{ color: '#0f3460' }}>{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6" style={{ color: '#0f3460' }}>이용 방법</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_TO_USE.map((item) => (
            <div key={item.step} className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3"
                style={{ backgroundColor: '#0f3460' }}
              >
                {item.step}
              </div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: '#0f3460' }}>{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 재무 분석이 중요한 이유 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f3460' }}>재무 분석이 중요한 이유</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            주식 투자에서 재무제표 분석은 기업의 실질적인 가치를 판단하는 핵심 과정입니다.
            PER, PBR, ROE 같은 재무지표는 단순한 숫자가 아니라 기업의 수익성, 성장성, 재무 안정성을 압축적으로 나타내는 신호입니다.
          </p>
          <p>
            예를 들어 PER(주가수익비율)이 동종 업계 평균보다 현저히 낮다면 저평가 신호일 수 있고,
            부채비율이 급등하고 있다면 재무 리스크가 커지고 있다는 경고일 수 있습니다.
            ROE(자기자본이익률)가 꾸준히 15% 이상을 유지하는 기업은 주주 자본을 효율적으로 활용한다는 뜻입니다.
          </p>
          <p>
            재무제표를 직접 읽고 이해하는 데는 상당한 시간과 전문 지식이 필요합니다.
            본 서비스는 이 과정을 자동화하여 누구나 체계적인 재무 분석을 시작할 수 있도록 돕습니다.
          </p>
        </div>
      </section>
    </main>
  )
}
