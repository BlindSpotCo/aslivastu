import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Default meta tags — overridden per-page by [pin].js Head */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="CkbpyCodnRCtYIItHhL7TD1F88qKFYmJaP_B00kAyyA" />
        <meta name="keywords" content="Delhi NCR neighbourhood review, Hauz Khas safety score, Gurugram neighbourhood quality, Noida area report, Delhi property buying guide, neighbourhood score Delhi, best areas to buy property Delhi" />
        <meta name="author" content="AsliVastu" />

        {/* Default OG tags for landing page / fallback */}
        <meta property="og:site_name" content="AsliVastu" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AsliVastu — Know Your Neighbourhood Before You Buy" />
        <meta property="og:description" content="Free neighbourhood quality scores for Delhi NCR. Safety, air quality, infrastructure, power and water supply — data-backed scores for 85+ areas." />
        <meta property="og:image" content="https://aslivastu.vercel.app/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://aslivastu.vercel.app" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AsliVastu — Know Your Neighbourhood Before You Buy" />
        <meta name="twitter:description" content="Free neighbourhood quality scores for Delhi NCR. Safety, air quality, infrastructure, power, water — data-backed scores for 85+ areas." />
        <meta name="twitter:image" content="https://aslivastu.vercel.app/og-default.png" />

        {/* Default page title */}
        <title>AsliVastu — Neighbourhood Quality Reports for Delhi NCR</title>

        {/* Sitemap discovery */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {/* Favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body style={{ margin: 0, padding: 0, background: '#0f0f0f' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
