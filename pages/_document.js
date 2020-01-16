import Document, {Html, Head, Main, NextScript} from 'next/document'
import React from 'react'

import {LOGO_URL} from 'lib/constants'

const Stylesheets = () =>
  process.env.NODE_ENV === 'production' ? (
    <>
      <link
        rel='stylesheet'
        href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
      />
      <link
        rel='stylesheet'
        href='https://unpkg.com/leaflet@1.5.1/dist/leaflet.css'
      />
      <link
        rel='stylesheet'
        href='https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css'
      />
      <link
        rel='stylesheet'
        href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.css'
      />
      <link
        rel='stylesheet'
        href='https://use.fontawesome.com/releases/v5.9.0/css/svg-with-js.css'
      />
    </>
  ) : (
    <>
      <link rel='stylesheet' href='/static/bootstrap.min.css' />
      <link rel='stylesheet' href='/static/leaflet/leaflet.css' />
      <link rel='stylesheet' href='/static/leaflet-draw/leaflet.draw.css' />
      <link rel='stylesheet' href='/static/mapbox-gl.css' />
      <link rel='stylesheet' href='/static/fontawesome.css' />
    </>
  )

export default class extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel='shortcut icon' href={LOGO_URL} type='image/x-icon' />
          <Stylesheets />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
