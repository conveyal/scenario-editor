import lonlat from '@conveyal/lonlat'

import {PROJECTION_ZOOM_LEVEL} from 'lib/constants'

/**
 * The grid extent is computed from the points. If the cell number for the right edge of the grid is rounded
 * down, some points could fall outside the grid. `lonlat.toPixel` and `lonlat.toPixel` naturally truncate down, which is
 * the correct behavior for binning points into cells but means the grid is (almost) always 1 row too
 * narrow/short, so we add 1 to the height and width when a grid is created in this manner.
 */
export default function calculateGridPoints(
  bounds: CL.Bounds,
  zoom = PROJECTION_ZOOM_LEVEL
): number {
  const topLeft = lonlat.toPixel([bounds.west, bounds.north], zoom)
  const bottomRight = lonlat.toPixel([bounds.east, bounds.south], zoom)
  const width = Math.abs(topLeft.x - bottomRight.x) + 1
  const height = Math.abs(topLeft.y - bottomRight.y) + 1
  return width * height
}
