import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

const resolveSiteUrl = () => {
  const explicitUrl = process.env.VITE_SITE_URL || process.env.SITE_URL
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const rawUrl = explicitUrl || (vercelUrl ? `https://${vercelUrl}` : 'https://financial-report-generator-taupe.vercel.app')
  return rawUrl.replace(/\/$/, '')
}

const siteUrl = resolveSiteUrl()

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const stripText = (value, maxLength = 155) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

const originalConsoleError = console.error
console.error = (...args) => {
  const message = String(args[0] ?? '')
  if (message.includes('useLayoutEffect does nothing on the server')) return
  originalConsoleError(...args)
}

const writeHtml = async (url, html) => {
  const filePath = url === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, url.replace(/^\//, ''), 'index.html')

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, html)
}

const writeSeoFiles = async (routes) => {
  const today = new Date().toISOString().slice(0, 10)
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => [
      '  <url>',
      `    <loc>${escapeXml(`${siteUrl}${route.url}`)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      route.url === '/'
        ? '    <priority>1.0</priority>'
        : `    <priority>${route.url.split('/').length > 3 ? '0.7' : '0.8'}</priority>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
    '',
  ].join('\n')

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')

  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap)
  await fs.writeFile(path.join(distDir, 'robots.txt'), robots)
}

const applyHead = (template, { url, title, description }) => {
  const canonical = siteUrl
    ? `<link rel="canonical" href="${escapeHtml(`${siteUrl}${url}`)}" />`
    : ''
  const meta = [
    canonical,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    '<meta property="og:type" content="article" />',
  ].filter(Boolean).join('\n    ')

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/s,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace('</head>', `    ${meta}\n  </head>`)
}

const vite = await createServer({
  root: rootDir,
  appType: 'custom',
  logLevel: 'error',
  resolve: {
    alias: [
      {
        find: 'react-router/dom',
        replacement: path.join(rootDir, 'node_modules/react-router/dist/production/dom-export.mjs'),
      },
      {
        find: 'react-router-dom',
        replacement: path.join(rootDir, 'node_modules/react-router-dom/dist/index.mjs'),
      },
      {
        find: 'react-router',
        replacement: path.join(rootDir, 'node_modules/react-router/dist/production/index.mjs'),
      },
    ],
  },
  optimizeDeps: { disabled: true },
  server: { middlewareMode: true },
})

try {
  const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf-8')
  const { default: PrerenderApp } = await vite.ssrLoadModule('/src/PrerenderApp.jsx')
  const { metricsData } = await vite.ssrLoadModule('/src/data/metricsGuideData.js')
  const { sectorsData } = await vite.ssrLoadModule('/src/data/sectorGuideData.js')
  const { companyCasesData } = await vite.ssrLoadModule('/src/data/companyCasesData.js')

  const routes = [
    {
      url: '/',
      title: '재무제표 분석 리포트 생성기',
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
      description: stripText(metric.summary || metric.description),
    })),
    ...sectorsData.map((sector) => ({
      url: `/sector-guide/${sector.id}`,
      title: `${sector.name} 업종 분석 가이드`,
      description: stripText(sector.summary || sector.description),
    })),
    ...companyCasesData.map((company) => ({
      url: `/company-cases/${company.id}`,
      title: `${company.name} 재무 분석 사례`,
      description: stripText(company.businessOverview),
    })),
  ]

  for (const route of routes) {
    const appHtml = renderToString(React.createElement(PrerenderApp, { url: route.url }))
    const html = applyHead(template, route).replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    )

    await writeHtml(route.url, html)
  }

  await writeSeoFiles(routes)

  console.log(`Prerendered ${routes.length} routes.`)
  console.log(`Generated robots.txt and sitemap.xml for ${siteUrl}.`)
} finally {
  await vite.close()
}
