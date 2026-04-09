export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#0f3460' }}>문의하기</h1>

      <section className="mb-8">
        <p className="text-gray-700 leading-relaxed mb-6">
          서비스 이용 중 불편한 점, 오류 신고, 데이터 오류, 개인정보 관련 문의 등
          모든 의견을 환영합니다.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">이메일 문의</div>
          <a
            href="mailto:freamwork@kakao.com"
            className="text-blue-600 hover:underline text-sm"
          >
            freamwork@kakao.com
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>자주 묻는 질문</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-800 mb-2">Q. 데이터가 최신이 아닌 것 같아요.</div>
            <div className="text-gray-600 text-sm">
              재무 데이터는 DART 공시 기준으로 제공됩니다. 최신 분기 보고서가 공시되지 않은 경우
              직전 연도 데이터가 표시될 수 있습니다.
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-800 mb-2">Q. 특정 기업이 검색되지 않아요.</div>
            <div className="text-gray-600 text-sm">
              DART에 등록된 상장기업만 지원합니다. 비상장기업 또는 최근 상장한 기업은
              데이터가 없을 수 있습니다.
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-800 mb-2">Q. 분석 결과를 투자에 활용해도 되나요?</div>
            <div className="text-gray-600 text-sm">
              본 서비스의 분석은 교육 목적으로만 제공됩니다. 실제 투자 결정은 전문 금융 투자 상담사와
              상의하시기 바랍니다.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
