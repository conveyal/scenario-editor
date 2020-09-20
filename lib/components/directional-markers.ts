import lonlat from '@conveyal/lonlat'
import {GridLayer as LeafletGridLayer} from 'leaflet'
import memoize from 'memoize-one'
import {GridLayer, GridLayerProps, withLeaflet} from 'react-leaflet'

import type {LineString} from 'geojson'

import {getBearingAndCoordinatesAlongLine} from 'lib/utils/markers'

interface Pattern {
  geometry: LineString
}

interface DirectionalMarkersProps extends GridLayerProps {
  color: string
  patterns: Pattern[]
}

const TZ = 256 // tile size
const LINE_WIDTH = 2
const LINE_LENGTH = 9
const EARTH_CIRCUMFERENCE_METERS = 40000000

// `createTile` is a protected method. Must extend to replace.
class DirectionalMarkersGridLayer extends LeafletGridLayer {
  color: string
  patterns: any[]

  constructor(options) {
    super(options)
    this.color = options.color
    this.patterns = options.patterns
  }

  createTile(coords) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = TZ
    const ctx = canvas.getContext('2d')
    const markers = memoizedGetMarkers(this.patterns, coords.z)
    if (ctx) {
      ctx.strokeStyle = this.color
      ctx.lineWidth = LINE_WIDTH
      drawMarkersInTile(markers, coords, coords.z, ({x, y}, bearing) => {
        // we know they're in the current tile so we can be lazy and just modulo
        x %= TZ
        y %= TZ

        // center it up
        x -= 1
        y -= 1

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((bearing * Math.PI) / 180)
        ctx.moveTo(-LINE_LENGTH, LINE_LENGTH)
        ctx.lineTo(0, 0)
        ctx.lineTo(LINE_LENGTH, LINE_LENGTH)
        ctx.stroke()
        ctx.restore()
      })
    }

    return canvas
  }
}

// For testing
export class DirectionalMarkers extends GridLayer<
  DirectionalMarkersProps,
  DirectionalMarkersGridLayer
> {
  createLeafletElement(
    props: DirectionalMarkersProps
  ): DirectionalMarkersGridLayer {
    return new DirectionalMarkersGridLayer(super.getOptions(props))
  }

  shouldComponentUpdate(nextProps: DirectionalMarkersProps): boolean {
    return (
      nextProps.color !== this.props.color ||
      nextProps.patterns !== this.props.patterns
    )
  }

  componentDidUpdate(nextProps: DirectionalMarkersProps): void {
    this.leafletElement.color = nextProps.color
    this.leafletElement.patterns = nextProps.patterns
    this.leafletElement.redraw()
  }
}

// For usage on a map component
export default withLeaflet(DirectionalMarkers)

// Spacing depends on the zoom level
function getSpacingMeters(z) {
  // We want a marker every 125px or so at the equator
  const tileSizeM = EARTH_CIRCUMFERENCE_METERS / Math.pow(2, z)
  return 0.5 * tileSizeM
}

// Memoize, because the function signature will be the same across tiles
const memoizedGetMarkers = memoize(getDirectionalMarkersForPatterns)

// Get directional markers patterns
export function getDirectionalMarkersForPatterns(patterns, z) {
  return patterns.reduce(
    (markers, p) => [
      ...markers,
      ...getBearingAndCoordinatesAlongLine(
        p.geometry.coordinates,
        getSpacingMeters(z)
      )
    ],
    []
  )
}

// Draw markers in tile
export function drawMarkersInTile(markers, tile, z, draw) {
  const tileBounds = {
    north: tile.y * TZ,
    south: (tile.y + 1) * TZ,
    west: tile.x * TZ,
    east: (tile.x + 1) * TZ
  }

  for (const marker of markers) {
    const mp = markerToPixel(marker, z)
    if (markerInTile(mp, tileBounds)) draw(mp, marker.bearing)
  }
}

const markerToPixel = (marker, z) => lonlat.toPixel(marker, z)
const markerInTile = (m, tb) =>
  m.x > tb.west && m.x < tb.east && m.y > tb.north && m.y < tb.south
