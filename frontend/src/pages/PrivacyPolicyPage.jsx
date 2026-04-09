export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#0f3460' }}>개인정보처리방침</h1>

      <p className="text-gray-600 mb-6 text-sm">최종 업데이트: 2026년 4월 9일</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>1. 개요</h2>
        <p className="text-gray-700 leading-relaxed">
          재무제표 분석 리포트 생성기(이하 "본 서비스")는 방문자의 개인정보 보호를 중요하게 생각하며,
          관련 법령을 준수합니다. 본 방침은 본 서비스가 수집하는 정보의 종류,
          이용 목적 및 관리 방법에 대해 안내합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>2. 수집하는 정보</h2>
        <p className="text-gray-700 leading-relaxed mb-2">본 서비스는 다음 정보를 자동으로 수집할 수 있습니다:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
          <li>방문 페이지 URL, 참조 URL</li>
          <li>브라우저 종류 및 운영체제 정보</li>
          <li>방문 일시 및 체류 시간</li>
          <li>쿠키 및 유사 추적 기술을 통해 수집된 정보</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          본 서비스는 회원가입 기능이 없으며, 이름·이메일·전화번호 등 식별 가능한 개인정보를 직접 수집하지 않습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>3. 쿠키 사용</h2>
        <p className="text-gray-700 leading-relaxed mb-2">
          본 서비스는 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다.
          쿠키는 사용자의 브라우저에 저장되는 소규모 텍스트 파일입니다.
        </p>
        <p className="text-gray-700 leading-relaxed">
          브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>4. 정보의 보유 및 이용 기간</h2>
        <p className="text-gray-700 leading-relaxed">
          수집된 정보는 서비스 운영 기간 동안 보유하며, 서비스 종료 시 즉시 파기합니다.
          단, 법령에 따라 보존 의무가 있는 경우 해당 기간 동안 보유합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>5. 이용자의 권리</h2>
        <p className="text-gray-700 leading-relaxed mb-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
          <li>개인정보 처리 현황 열람 요청</li>
          <li>오류 정정 요청</li>
          <li>삭제 요청</li>
          <li>처리 정지 요청</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>6. 방침의 변경</h2>
        <p className="text-gray-700 leading-relaxed">
          본 개인정보처리방침은 법령 변경 또는 서비스 정책 변경에 따라 수정될 수 있습니다.
          변경 시 본 페이지 상단의 업데이트 날짜를 통해 안내합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#0f3460' }}>7. 문의</h2>
        <p className="text-gray-700 leading-relaxed">
          개인정보 처리에 관한 문의사항은 본 서비스의 운영자에게 연락하시기 바랍니다.
        </p>
      </section>
    </div>
  )
}
