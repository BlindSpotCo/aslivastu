// pages/sitemap.xml.js
// Accessible at: https://aslivastu.vercel.app/sitemap.xml

// Was a private literal containing ONLY Delhi-region entries — Bangalore's 66
// areas were silently missing from the sitemap. Importing the shared module
// fixes that for free and keeps future cities (Punjab) included automatically.
import { PIN_META } from '../lib/pinMeta'

function generateSitemap() {
  const base = 'https://aslivastu.vercel.app'
  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { url: base,           priority: '1.0', changefreq: 'weekly' },
    { url: `${base}/compare`, priority: '0.6', changefreq: 'monthly' },
  ]

  // Excludes scored:false entries (NCR-fringe pins and all of Punjab Phase 1
  // right now — see PUNJAB_ROLLOUT.md) so search engines don't index a batch
  // of "No data for this pin" pages. Was previously indexing all of them
  // unconditionally, which got worse the moment 52 unscored Punjab entries
  // were added to PIN_META — fixing it here rather than carrying it forward.
  const reportPages = Object.entries(PIN_META)
    .filter(([, m]) => m.scored !== false)
    .map(([pin]) => ({
      url: `${base}/report/${pin}`,
      priority: '0.9',
      changefreq: 'daily',
    }))

  const allPages = [...staticPages, ...reportPages]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export default function Sitemap() {
  // This component is never rendered — getServerSideProps handles the response
  return null
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSitemap()
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
  res.write(sitemap)
  res.end()
  return { props: {} }
}
