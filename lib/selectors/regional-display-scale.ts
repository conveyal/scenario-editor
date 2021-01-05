import {color as parseColor, rgb, RGBColor} from 'd3-color'
import {schemeBlues, schemeReds} from 'd3-scale-chromatic'
import get from 'lodash/get'
import {ckmeans, sample} from 'simple-statistics'
import {createSelector} from 'reselect'
import {constructor as XorShift} from 'xorshift'

import selectDisplayGrid from './regional-display-grid'

// Max sampled values. CKMeans dramatically slows down after 1000 values. See
// bench/ckmeans.js for why we ended up with 1000.
const MAX_SAMPLE_SIZE = 1000

// Must be an odd number.
const TOTAL_BREAKS = 5

// Default opacity
const OPACITY = 0.42

// Convert to rgba colors
function toRGBA(c: string) {
  const rgb = parseColor(c).rgb()
  rgb.opacity = OPACITY
  return rgb
}

// Remove the lightest color from the schemes
const schemeBlueDarken = schemeBlues[TOTAL_BREAKS + 1].slice(1)
const schemeRedDarken = schemeReds[TOTAL_BREAKS + 1].slice(1).reverse()

// Color ranges. Add a transparent point for 0s
const zeroColor = rgb(255, 255, 255, 0)
const colorRangePositive = schemeBlueDarken.map(toRGBA)
const colorRangeNegative = schemeRedDarken.map(toRGBA)

// Choropleth style colorizer for writing to Canvas. Canvas takes an RGBA array
// for colors with the A being in the range of 0-255.
function createColorizer(breaks: number[], colorRange: RGBColor[]) {
  const colors = colorRange.map((c) => [
    c.r,
    c.g,
    c.b,
    Math.floor(c.opacity * 255)
  ])
  return (v: number) => {
    const floored = Math.floor(v)
    for (let i = 0; i < breaks.length; i++) {
      if (floored <= breaks[i]) return colors[i]
    }
    return [255, 255, 255, 0]
  }
}

const negate = (b: number) => -b

export default createSelector(selectDisplayGrid, (grid?: CL.RegionalGrid) => {
  if (!grid || get(grid, 'data.length') < 1) return null
  if (grid.min === grid.max) {
    return {
      breaks: [],
      colorRange: [],
      colorizer: () => [0, 0, 0, 0]
    }
  }

  // CKMeans throws an error when clusters requested > total values.
  try {
    // All values are positive
    if (grid.min >= 0) {
      const values = selectRandomGridValues(grid)
      const clusters: number[][] = ckmeans(values, colorRangePositive.length)
      const breaks = [0, ...findBreaks(clusters)]
      const colorRange = [zeroColor, ...colorRangePositive]

      // Ensure that the max is included. Random sampling may have missed it.
      breaks[breaks.length - 1] = grid.max

      const scale = {
        breaks,
        colorizer: createColorizer(breaks, colorRange),
        colorRange,
        error: false
      }
      return scale
    }

    // All values are negative
    if (grid.max <= 0) {
      const values = selectRandomGridValues(grid)
      const clusters: number[][] = ckmeans(values, colorRangeNegative.length)
      const breaks = [...findBreaks(clusters), 0]
      const colorRange = [...colorRangeNegative, zeroColor]
      return {
        breaks,
        colorizer: createColorizer(breaks, colorRange),
        colorRange,
        error: false
      }
    }

    if (grid.max > Math.abs(grid.min)) {
      // Sample only the positive numbers
      const positiveValues = selectRandomGridValues(grid, (v) => v > 0)
      // Add an additional break because the cluster around 0 is transparent
      const positiveClusters: number[][] = ckmeans(
        positiveValues,
        colorRangePositive.length + 1
      )
      const positiveBreaks = findBreaks(positiveClusters)

      // Ensure that the breaks include the grid.max. Random sampling may have
      // missed it.
      positiveBreaks[positiveBreaks.length - 1] = grid.max

      // Find the min bin. Iterate until a bin is found that contains the
      // absolute value of the min.
      const minBin = positiveBreaks.findIndex((b) => b >= Math.abs(grid.min))
      // Slice off the end (creates new array), reverse (mutates) and negate.
      // [1, 10, 100] => [1, 10] => [10, 1] => [-10, -1]
      const negativeBreaks = positiveBreaks
        .slice(0, minBin)
        .reverse()
        .map((b) => -b)

      const breaks = [...negativeBreaks, ...positiveBreaks]
      const colorRange = [
        // Less negative, less negative colors,
        ...colorRangeNegative.slice(
          colorRangeNegative.length - negativeBreaks.length
        ),
        zeroColor,
        ...colorRangePositive
      ]

      return {
        breaks,
        colorizer: createColorizer(breaks, colorRange),
        colorRange,
        error: false
      }
    }

    if (grid.max <= Math.abs(grid.min)) {
      // Sample only the negative numbers
      const negativeValues = selectRandomGridValues(grid, (v) => v < 0)
      // Add an additional break because the cluster around 0 is transparent
      const negativeClusters = ckmeans(
        negativeValues,
        colorRangeNegative.length + 1
      )
      // Find the breaks and revmove the one closest to 0.
      const negativeBreaks = findBreaks(negativeClusters).slice(0, -1)

      // Find the max bin. Flip the breaks. Iterate until a bin is found that
      // contains the max value.
      const maxBin = negativeBreaks.findIndex((b) => -b <= grid.max)

      // Slice (create a new array), negate and reverse (mutates array).
      // [-100, -10 -1] => [-10, -1] => [10, 1] => [1, 10]
      const positiveBreaks = negativeBreaks.slice(maxBin).map(negate).reverse()

      // Ensure that the largest value is contained.
      if (positiveBreaks[positiveBreaks.length - 1] < grid.max) {
        positiveBreaks.push(grid.max)
      }

      const breaks = [...negativeBreaks, ...positiveBreaks]
      const colorRange = [
        ...colorRangeNegative,
        zeroColor,
        // Less positive breaks, less positive colors
        ...colorRangePositive.slice(0, positiveBreaks.length)
      ]

      return {
        breaks,
        colorizer: createColorizer(breaks, colorRange),
        colorRange,
        error: false
      }
    }
  } catch (e: unknown) {
    return {
      breaks: [],
      colorRange: [],
      colorizer: () => [0, 0, 0, 0],
      error: e
    }
  }
})

// Filtering out the zeros seems to give more nuanced breaks. There are a huge
// amount of zeros.
const filterZero = (v: number) => v !== 0

/**
 * Randomly sample filtered grid values.
 */
function selectRandomGridValues(
  grid: CL.RegionalGrid,
  filter = filterZero
): number[] {
  const filtered: number[] = Array.from(grid.data.filter(filter))
  if (filtered.length <= MAX_SAMPLE_SIZE) return filtered

  // Seed with the grid dimensions to sample the same points on similar grids
  const generator = new XorShift([
    grid.west,
    grid.north,
    grid.width,
    grid.height
  ])
  return sample<number>(filtered, MAX_SAMPLE_SIZE, () => generator.random())
}

// Find the maximum values in each cluster
function findBreaks(clusters: number[][]) {
  return clusters.map((c) => c[c.length - 1])
}
