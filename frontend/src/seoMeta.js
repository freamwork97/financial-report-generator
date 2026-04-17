import { metricsData } from './data/metricsGuideData'
import { sectorsData } from './data/sectorGuideData'
import { companyCasesData } from './data/companyCasesData'

export const SITE_NAME = '재무제표 분석 리포트 생성기'
export const DEFAULT_SITE_URL = 'https://financial-report-generator-taupe.vercel.app'

export const getSiteUrl = (env = {}) => {
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env || {} : {}
  const explicitUrl = env.VITE_SITE_URL || env.SITE_URL || viteEnv.VITE_SITE_URL || viteEnv.SITE_URL
  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || viteEnv.VERCEL_PROJECT_PRODUCTION_URL || viteEnv.VERCEL_URL
  const rawUrl = explicitUrl || (vercelUrl ? `https://${vercelUrl}` : DEFAULT_SITE_URL)
  return rawUrl.replace(/\/$/, '')
}

const normalizePathname = (pathname) => {
  if (!pathname) return '/'
  const cleanPath = pathname.split('?')[0].split('#')[0]
  return cleanPath.length > 1 ? cleanPath.replace(/\/$/, '') : '/'
}

export const stripSeoText = (value, maxLength = 155) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text
}

export const getAllSeoRoutes = () => [
  {
    url: '/',
    title: SITE_NAME,
    description: 'DART 기반 기업 재무제표 자동 분석 리포트 생성기입니다. 재무지표 사전, 업종별 투자 가이드, 기업 분석 사례를 제공합니다.',
  },
  {
    url: '/metrics-guide',
    title: '재무지표 사전',
    description: 'PER, PBR, ROE, EV/EBITDA 등 주식 투자에 필요한 핵심 재무지표의 계산식과 해석 기준을 정리했습니다.',
  },
  {
    url: '/sector-guide',
    title: '업종별 분석 가이드',
    description: '반도체, 금융, 바이오, 유통, IT서비스, 건설 업종별 핵심 재무지표와 분석 순서를 안내합니다.',
  },
  {
    url: '/company-cases',
    title: '기업 분석 사례집',
    description: '국내 주요 상장기업의 사업 구조, 재무 지표, 투자 포인트, 리스크를 사례 중심으로 정리했습니다.',
  },
  {
    url: '/about',
    title: '서비스 소개',
    description: '재무제표 분석 리포트 생성기의 목적, 주요 기능, 데이터 출처, 투자 유의사항을 안내합니다.',
  },
  {
    url: '/contact',
    title: '문의하기',
    description: '서비스 이용 문의, 오류 신고, 데이터 오류, 개인정보 관련 문의를 접수하는 페이지입니다.',
  },
  {
    url: '/privacy-policy',
    title: '개인정보처리방침',
    description: '재무제표 분석 리포트 생성기의 개인정보 처리 방식, 쿠키 사용, 이용자 권리를 안내합니다.',
  },
  ...metricsData.map((metric) => ({
    url: `/metrics-guide/${metric.id}`,
    title: `${metric.fullName} 계산법과 해석 기준`,
    description: stripSeoText(metric.summary || metric.description),
  })),
  ...sectorsData.map((sector) => ({
    url: `/sector-guide/${sector.id}`,
    title: `${sector.name} 업종 분석 가이드`,
    description: stripSeoText(sector.summary || sector.description),
  })),
  ...companyCasesData.map((company) => ({
    url: `/company-cases/${company.id}`,
    title: `${company.name} 재무 분석 사례`,
    description: stripSeoText(company.businessOverview),
  })),
]

export const getSeoMeta = (pathname) => {
  const normalized = normalizePathname(pathname)
  const route = getAllSeoRoutes().find((item) => item.url === normalized)

  if (route) {
    return {
      ...route,
      ogType: normalized === '/' ? 'website' : 'article',
      robots: 'index,follow',
    }
  }

  if (normalized === '/results') {
    return {
      url: normalized,
      title: '기업 재무 분석 결과',
      description: '선택한 기업의 재무제표 분석 결과 페이지입니다.',
      ogType: 'website',
      robots: 'noindex,follow',
    }
  }

  return {
    url: normalized,
    title: SITE_NAME,
    description: 'DART 기반 기업 재무제표 자동 분석 리포트 생성기입니다.',
    ogType: 'website',
    robots: 'noindex,follow',
  }
}

const upsertMeta = ({ name, property, content }) => {
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    if (name) element.setAttribute('name', name)
    if (property) element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export const applySeoMetaToDocument = (meta, siteUrl = getSiteUrl()) => {
  if (typeof document === 'undefined') return

  const canonicalUrl = `${siteUrl}${meta.url}`
  document.title = meta.title

  upsertMeta({ name: 'description', content: meta.description })
  upsertMeta({ name: 'robots', content: meta.robots })
  upsertMeta({ property: 'og:title', content: meta.title })
  upsertMeta({ property: 'og:description', content: meta.description })
  upsertMeta({ property: 'og:type', content: meta.ogType })
  upsertMeta({ property: 'og:url', content: canonicalUrl })
  upsertMeta({ property: 'og:site_name', content: SITE_NAME })
  upsertMeta({ name: 'twitter:card', content: 'summary' })
  upsertMeta({ name: 'twitter:title', content: meta.title })
  upsertMeta({ name: 'twitter:description', content: meta.description })

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', canonicalUrl)
}
