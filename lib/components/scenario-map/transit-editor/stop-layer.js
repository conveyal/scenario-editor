// @flow
import {point, TileLayer} from 'leaflet'
import {BaseTileLayer} from 'react-leaflet'

import {MINIMUM_SNAP_STOP_ZOOM_LEVEL} from '../../../constants'

import type {Point} from '../../../types'

type Props = {
  strokeStyle?: string,
  stops: Array<{
    stop_lat: number,
    stop_lon: number
  }>
}

/**
 * An optimized layer for drawing stops rapidly, adapted from https://github.com/conveyal/leaflet-transit-editor/blob/master/lib/stop-layer.js
 */
export default class StopLayer extends BaseTileLayer<void, Props, void> {
  componentWillMount () {
    super.componentWillMount()
    this.leafletElement = new TileLayer.Canvas()
    this.leafletElement.drawTile = this.drawTile
  }

  drawTile = (cvs: HTMLCanvasElement, tilePt: Point, z: number) => {
    const {map} = this.context
    const {stops, strokeStyle} = this.props
    const ctx = cvs.getContext('2d')
    if (z >= MINIMUM_SNAP_STOP_ZOOM_LEVEL && ctx) {
      ctx.strokeStyle = strokeStyle || '#888'
      // get the bounds
      const topLeft = map.unproject([tilePt.x * 256, tilePt.y * 256], z)
      const brPoint = point([tilePt.x + 1, tilePt.y + 1])
      const botRight = map.unproject([brPoint.x * 256, brPoint.y * 256], z)
      const stopWithinBounds = (s) => s.stop_lat < topLeft.lat && s.stop_lat > botRight.lat && s.stop_lon > topLeft.lng && s.stop_lon < botRight.lng
      const drawStopToCanvas = (s) => {
        // get coordinates
        // lat first for leaflet, every so often Lineland seems like a good idea
        // http://www.gutenberg.org/ebooks/97
        let { x, y } = map.project([s.stop_lat, s.stop_lon], z)

        // we know they're in the current tile so we can be lazy and just modulo
        x %= 256
        y %= 256

        // center it up
        x -= 1
        y -= 1

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.stroke()
      }

      // find relevant stops and draw them
      stops
        .filter(stopWithinBounds)
        .forEach(drawStopToCanvas)
    }
  }
}
