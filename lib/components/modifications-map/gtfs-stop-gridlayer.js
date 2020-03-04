import lonlat from '@conveyal/lonlat'
import {GridLayer, withLeaflet} from 'react-leaflet'

import {MINIMUM_SNAP_STOP_ZOOM_LEVEL} from 'lib/constants'
import colors from 'lib/constants/colors'
import createLogError from 'lib/utils/log-error'
import getStopRadius from 'lib/utils/get-stop-radius'

const TZ = 256 // size of a tile

// Limit errors shown
const logError = createLogError()

/**
 * An optimized layer for drawing stops rapidly, adapted from
 * https://github.com/conveyal/leaflet-transit-editor/blob/master/lib/stop-layer.js
 */
export class GTFSStopGridLayer extends GridLayer {
  createLeafletElement(props) {
    const gridLayer = super.createLeafletElement(props)
    gridLayer.createTile = createCreateTile(props)
    return gridLayer
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.stops !== this.props.stops
  }

  componentDidUpdate() {
    this.leafletElement.createTile = createCreateTile(this.props)
    this.leafletElement.redraw()
  }
}

// Add leaflet element
export default withLeaflet(GTFSStopGridLayer)

/**
 * Generate the GridLayer.createTile function with the component props.
 */
function createCreateTile(props) {
  const validStops = props.stops.filter(s => s.stop_lat && s.stop_lon)
  return function createTile(coords) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = TZ
    const ctx = canvas.getContext('2d')
    if (coords.z >= MINIMUM_SNAP_STOP_ZOOM_LEVEL && ctx) {
      ctx.strokeStyle = colors.NEUTRAL
      const SR = (getStopRadius(coords.z) * 2) / 3 // 2/3rds normal stops
      drawStopsInTile(validStops, coords, coords.z, s => {
        const offset = SR / 2
        ctx.beginPath()
        // In the current tile, so modulo by the tile size and center it
        ctx.arc((s.x % TZ) - offset, (s.y % TZ) - offset, SR, 0, Math.PI * SR)
        ctx.stroke()
      })
    }
    return canvas
  }
}

/**
 * Convert stops to pixel coordinates, check if they are within the tile bounds
 * and then call the draw function on the stop. Created in this style for test.
 */
export function drawStopsInTile(stops, tile, z, draw) {
  const tileBounds = {
    north: tile.y * TZ,
    south: (tile.y + 1) * TZ,
    west: tile.x * TZ,
    east: (tile.x + 1) * TZ
  }

  for (const stop of stops) {
    const sp = stopToPixel(stop, z)
    if (sp && stopInTile(sp, tileBounds)) draw(sp)
  }
}

export function stopToPixel(stop, z) {
  try {
    return lonlat.toPixel([stop.stop_lon, stop.stop_lat], z)
  } catch (e) {
    logError(e)
  }
}

/**
 * A tile's x increases to the right and y increases down.
 */
export function stopInTile(s, tb) {
  return s.x > tb.west && s.x < tb.east && s.y > tb.north && s.y < tb.south
}
