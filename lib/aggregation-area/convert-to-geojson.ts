import lonlat from '@conveyal/lonlat'

import jsolines from 'lib/utils/jsolines'

// cut off at cells that are 50% covered by the aggregation area. 30_000 would be 30% etc
const MAX = 100_000
const CUTOFF = 50_000

/**
 * Convert an aggregation area represented as raster to an outline to display
 * on the map
 */
export default function convertToGeoJSON(
  grid: CL.ParsedGrid
): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const {zoom, west, north, width, height, data} = grid

  // jsolines fills the cells around the edges of the area with Infinity to avoid edge effects.
  // Since the aggregation area mask goes all the way to the edge of the grid, make a slightly bigger
  // grid so we don't lose valuable data
  // TODO just fix jsolines
  const expandedWidth = width + 2
  const expandedHeight = height + 2

  const surface = new Int32Array(expandedWidth * expandedHeight)
  // fill with infinity (we reverse 0 and infinity below since Jsolines expects the contour line to
  // enclose an area of low values
  surface.fill(MAX)

  for (let y = 1; y < expandedHeight - 1; y++) {
    for (let x = 1; x < expandedWidth - 1; x++) {
      const indexInSurface = y * expandedWidth + x
      const indexInAggregationAreaGrid = (y - 1) * (expandedWidth - 2) + (x - 1)
      // invert range  [0, MAX], jsolines expects to find polygons that enclose areas of low values
      // (originally intended for use with travel times)
      surface[indexInSurface] = MAX - data[indexInAggregationAreaGrid]
    }
  }

  return jsolines({
    surface,
    width: expandedWidth,
    height: expandedHeight,
    cutoff: MAX - CUTOFF, // invert cutoff so it is relative to original surface
    project: ([x, y]) => {
      // - 1 due to increasing the grid size above
      const ll = lonlat.fromPixel(
        {
          x: x + west - 1,
          y: y + north - 1
        },
        zoom
      )
      return [ll.lon, ll.lat]
    },
    // Temporarily disabling interpolation because it causes issues near edges (PR with fix made to
    // jsolines). Then again, maybe we want the blocky, un-interpolated style here to make it clear
    // that we've rasterized a vector geometry.
    interpolation: false
  })
}
