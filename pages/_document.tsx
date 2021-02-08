import Document, {Html, Head, Main, NextScript} from 'next/document'
import React from 'react'

import {LOGO_URL} from 'lib/constants'

const Stylesheets = () => (
  <>
    <link rel='stylesheet' href='/static/leaflet/leaflet.css' />
    <link rel='stylesheet' href='/static/leaflet-draw/leaflet.draw.css' />
    <link rel='stylesheet' href='/static/mapbox-gl.css' />
    <link rel='stylesheet' href='/static/fontawesome.css' />
  </>
)

const Analytics = () => (
  <>
    {process.browser && (
      // Render only in browser to prevent double tracking: https://github.com/vercel/next.js/issues/9070
      <script
        async
        defer
        data-domain='analysis.conveyal.com'
        src='https://plausible.conveyal.com/js/index.js'
      />
    )}
  </>
)

const ZenDeskWidget = () =>
  process.env.ZENDESK_KEY != null && (
    <script
      id='ze-snippet'
      src={`https://static.zdassets.com/ekr/snippet.js?key=${process.env.ZENDESK_KEY}`}
    />
  )

export default class extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600'
            type='text/css'
          />
          <link rel='shortcut icon' href={LOGO_URL} type='image/x-icon' />
          <Stylesheets />
          <Analytics />
          <ZenDeskWidget />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
