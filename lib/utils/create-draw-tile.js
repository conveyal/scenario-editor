import gridCellInterpolator from 'lib/utils/grid-cell-interpolator'
import nearestNeighborInterpolator from 'lib/utils/nearest-interpolator'

const TILE_SIZE = 256

export default function createDrawTile({colorizer, grid}) {
  /**
   * Given a web Mercator x, y, and zoom values for a single tile, as well as
   * an associated canvas object, visualize the grid cell counts falling within
   * that tile as colors or dots on the canvas.
   */
  return function drawTile(canvas, mercTileCoord, zoom) {
    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) return
    const imageData = canvasContext.createImageData(canvas.width, canvas.height)

    // Convert web Mercator tile position to pixels relative to the left and
    // the top of the world at its zoom level.
    const mercPixelX = mercTileCoord.x * TILE_SIZE
    const mercPixelY = mercTileCoord.y * TILE_SIZE

    // Compute the divisor that will convert pixel (or tile) coordinates at the
    // visual map tile zoom level to pixel (or tile) coordinates at the
    // opportunity density grid's zoom level, i.e. the number of visual map
    // pixels (or tiles) an opportunity grid pixel (or tile) is wide. This is
    // always a power of two, so as an optimization we could just store the
    // difference in zoom levels and scale using bitshift operators.
    // When zoomDifference is non-positive (when we're really zoomed out)
    // tileWidthInGridCells will be > 256 and gridCellWidthInTilePixels will be
    // in (0..1).
    const zoomDifference = zoom - grid.zoom
    const gridCellWidthInTilePixels = 2 ** zoomDifference
    const tileWidthInGridCells = TILE_SIZE / gridCellWidthInTilePixels

    // Fall back on nearest neighbor when each grid cell covers one or less tile pixels.
    // Also when each tile covers a fraction of a grid cell.
    const finalInterpolator =
      zoomDifference <= 1 || zoomDifference > 8
        ? nearestNeighborInterpolator
        : gridCellInterpolator

    // Find the range of grid cells that contribute to the contents of the map
    // tile we're rendering. Most interpolators consider the grid cell value to
    // be at the center of the cell, so we need to hit one extra row of cells
    // outside the tile.
    const gridOffset = finalInterpolator.gridOffset
    const gxMin = Math.floor(
      mercPixelX / gridCellWidthInTilePixels - grid.west - gridOffset
    )
    const gyMin = Math.floor(
      mercPixelY / gridCellWidthInTilePixels - grid.north - gridOffset
    )
    const gxMax = Math.ceil(gxMin + tileWidthInGridCells + gridOffset)
    const gyMax = Math.ceil(gyMin + tileWidthInGridCells + gridOffset)

    // When zoomed far enough out, we can skip over some grid cells.
    let gridStep = 1
    if (zoomDifference < 0) gridStep = 2 ** -zoomDifference

    // Iterate over all opportunity grid pixels that contribute to the contents
    // of the map tile we're rendering. Due to the fact that mercator grid zoom
    // level sizes are powers of two, when multiple opportunity grid cells fall
    // within a map tile there are always an integer number of them and no
    // partial overlaps. But for interpolation purposes, we work on boxes that
    // are offset 1/2 cell to the east and south because we consider grid cell
    // values to be at the center (rather than the corner) of those cells.
    // FIXME maybe we should be adding half the gridStep to use the grid cell
    // in the center of the range.
    for (let gx = gxMin; gx < gxMax; gx += gridStep) {
      for (let gy = gyMin; gy < gyMax; gy += gridStep) {
        const patch = finalInterpolator(grid, gx | 0, gy | 0)
        // Iterate over all the output tile pixels covered by this patch.
        // These are truncated to integers to handle the case where grid cells
        // are smaller than tile pixels.
        const txMin =
          ((gx - gxMin - gridOffset) * gridCellWidthInTilePixels) | 0
        const tyMin =
          ((gy - gyMin - gridOffset) * gridCellWidthInTilePixels) | 0
        const txMax = Math.ceil(txMin + gridCellWidthInTilePixels) | 0
        const tyMax = Math.ceil(tyMin + gridCellWidthInTilePixels) | 0

        for (let ty = tyMin; ty < tyMax; ty++) {
          if (ty < 0 || ty > 255) continue
          // TODO: refactor to iterate over relative x and y?
          // Get a single-row 1d interpolator function from the 2d interpolator
          const row = patch((ty - tyMin) / gridCellWidthInTilePixels)
          for (let tx = txMin; tx < txMax; tx++) {
            if (tx < 0 || tx > 255) continue
            // TODO refactor to iterate over relative x and y?
            let interpolatedValue = row(
              (tx - txMin) / gridCellWidthInTilePixels
            )

            const color = colorizer(interpolatedValue)
            if (color[3] !== 0) {
              // Resulting color has some opacity, write it into the tile
              const imgOffset = (ty * TILE_SIZE + tx) * 4
              imageData.data.set(color, imgOffset)
            }
          }
        }
      }
    }
    canvasContext.putImageData(imageData, 0, 0)
  }
}
