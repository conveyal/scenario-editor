// @flow
import {Browser} from 'leaflet'
import React from 'react'
import {TileLayer} from 'react-leaflet'

const DEFAULT_ZINDEX = 40
const URL = Browser.retina && process.env.LABEL_RETINA_URL
  ? process.env.LABEL_RETINA_URL
  : process.env.LABEL_TILE_URL

export default function LabelLayer ({zIndex = DEFAULT_ZINDEX}: {zIndex?: number}) {
  return process.env.LABEL_TILE_URL
    ? <TileLayer zIndex={zIndex} url={URL} />
    : <g />
}
