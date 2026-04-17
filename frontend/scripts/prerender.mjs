import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

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

const writeSeoFiles = async (routes, siteUrl) => {
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

const applyHead = (template, routeMeta, siteUrl) => {
  const canonicalUrl = `${siteUrl}${routeMeta.url}`
  const metaTags = [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="robots" content="${escapeHtml(routeMeta.robots)}" />`,
    `<meta property="og:title" content="${escapeHtml(routeMeta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(routeMeta.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(routeMeta.ogType)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    '<meta property="og:site_name" content="재무제표 분석 리포트 생성기" />',
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(routeMeta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(routeMeta.description)}" />`,
  ].join('\n    ')

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(routeMeta.title)}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/s,
      `<meta name="description" content="${escapeHtml(routeMeta.description)}" />`,
    )
    .replace('</head>', `    ${metaTags}\n  </head>`)
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
  const { getAllSeoRoutes, getSeoMeta, getSiteUrl } = await vite.ssrLoadModule('/src/seoMeta.js')
  const siteUrl = getSiteUrl(process.env)
  const routes = getAllSeoRoutes()

  for (const route of routes) {
    const appHtml = renderToString(React.createElement(PrerenderApp, { url: route.url }))
    const html = applyHead(template, getSeoMeta(route.url), siteUrl).replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    )

    await writeHtml(route.url, html)
  }

  await writeSeoFiles(routes, siteUrl)

  console.log(`Prerendered ${routes.length} routes.`)
  console.log(`Generated robots.txt and sitemap.xml for ${siteUrl}.`)
} finally {
  await vite.close()
}
