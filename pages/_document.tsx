import Document, {Html, Head, Main, NextScript} from 'next/document'

import {LOGO_URL} from 'lib/constants'

const fontURL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600&display=swap'

const Stylesheets = () => (
  <>
    <link rel='stylesheet' href='/static/leaflet/leaflet.css' />
    <link rel='stylesheet' href='/static/leaflet-draw/leaflet.draw.css' />
    <link rel='stylesheet' href='/static/mapbox-gl.css' />
    <link rel='stylesheet' href='/static/fontawesome.css' />
  </>
)

const Analytics = () => (
  <script
    async
    defer
    data-domain='analysis.conveyal.com'
    src='https://plausible.conveyal.com/js/index.js'
  />
)

const ZenDeskWidget = () =>
  process.env.ZENDESK_KEY != null && (
    <script
      async
      defer
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
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link rel='preload' as='style' href={fontURL} />
          <link rel='stylesheet' href={fontURL} type='text/css' />
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
