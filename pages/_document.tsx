import {ColorModeScript} from '@chakra-ui/color-mode'
import Document, {Html, Head, Main, NextScript} from 'next/document'

import {FONT_URL, LOGO_URL} from 'lib/constants'

const Analytics = () =>
  process.env.NODE_ENV === 'production' && (
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
            rel='preload'
            href={FONT_URL}
            as='font'
            type='font/woff2'
            crossOrigin='anonymous'
          />
          <link rel='shortcut icon' href={LOGO_URL} type='image/x-icon' />

          <Analytics />
          <ZenDeskWidget />
          <ColorModeScript />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
