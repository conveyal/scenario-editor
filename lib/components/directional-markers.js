// @flow
import lonlat from '@conveyal/lonlat'
import {GridLayer, point} from 'leaflet'
import {MapLayer} from 'react-leaflet'

import {getBearingAndCoordinatesAlongLine} from '../utils/markers'

import type {Pattern} from '../types'

type Props = {
  color: string,
  patterns: Pattern[]
}

export default class DirectionalMarkers extends MapLayer {
  props: Props

  createLeafletElement () {
    const gridLayer = new GridLayer()
    gridLayer.createTile = this.createTile
    return gridLayer
  }

  componentWillReceiveProps () {
    this.currentZoom = this.markers = undefined
  }

  componentDidUpdate (prevProps: Props) {
    if (prevProps.patterns !== this.props.patterns) this.leafletElement.redraw()
  }

  createTile = (coords: {x: number, y: number, z: number}) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    this.drawTile(canvas, coords, coords.z)
    return canvas
  }

  drawTile = (
    cvs: HTMLCanvasElement,
    tilePt: {x: number, y: number},
    z: number
  ) => {
    const {color, patterns} = this.props

    // We want a marker every 125px or so at the equator
    const tileSizeM = 40000000 / Math.pow(2, z)
    const spacingMeters = 0.5 * tileSizeM

    // Will run once per update
    if (this.currentZoom !== z || this.markers === undefined) {
      this.markers = patterns.reduce(
        (markers, pattern) => [
          ...markers,
          ...getBearingAndCoordinatesAlongLine({
            coordinates: pattern.geometry.coordinates,
            spacingMeters
          })
        ],
        []
      )
    }

    const {map} = this.context

    const ctx = cvs.getContext('2d')

    if (ctx) {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      // get the bounds
      const topLeft = lonlat(map.unproject([tilePt.x * 256, tilePt.y * 256], z))
      const brPoint = point([tilePt.x + 1, tilePt.y + 1])
      const botRight = lonlat(
        map.unproject([brPoint.x * 256, brPoint.y * 256], z)
      )

      const isWithinBounds = m =>
        m.coordinates[1] < topLeft.lat &&
        m.coordinates[1] > botRight.lat &&
        m.coordinates[0] > topLeft.lon &&
        m.coordinates[0] < botRight.lon

      const drawMarkerToCanvas = m => {
        // get coordinates
        // lat first for leaflet, every so often Lineland seems like a good idea
        // http://www.gutenberg.org/ebooks/97
        let {x, y} = map.project([m.coordinates[1], m.coordinates[0]], z)

        // we know they're in the current tile so we can be lazy and just modulo
        x %= 256
        y %= 256

        // center it up
        x -= 1
        y -= 1

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(m.bearing * Math.PI / 180)
        ctx.moveTo(-9, 9)
        ctx.lineTo(0, 0)
        ctx.lineTo(9, 9)
        ctx.stroke()
        ctx.restore()
      }

      // find relevant stops and draw them
      this.markers.filter(isWithinBounds).forEach(drawMarkerToCanvas)
    }
  }
}
