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
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `
      }}
    />
  </>
)

export default class extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600'
          />
          <link rel='shortcut icon' href={LOGO_URL} type='image/x-icon' />
          <Stylesheets />
          {process.env.NEXT_PUBLIC_GA_TRACKING_ID && <Analytics />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
