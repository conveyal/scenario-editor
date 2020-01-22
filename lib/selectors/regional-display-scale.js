import {color as parseColor} from 'd3-color'
import {schemeBlues, schemeReds} from 'd3-scale-chromatic'
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
const toRGBA = colors =>
  colors.map(parseColor).map(c => {
    const rgb = c.rgb()
    rgb.opacity = OPACITY
    return rgb
  })

// Remove the lightest color from the schemes
const schemeBlueDarken = schemeBlues[TOTAL_BREAKS + 1].slice(1)
const schemeRedDarken = schemeReds[TOTAL_BREAKS + 1].slice(1).reverse()

// Color ranges. Add a transparent point for 0s
const zeroColor = {r: 255, g: 255, b: 255, opacity: 0}
const colorRangePositive = toRGBA(schemeBlueDarken)
const colorRangeNegative = toRGBA(schemeRedDarken)

// Choropleth style colorizer for writing to Canvas. Canvas takes an RGBA array
// for colors with the A being in the range of 0-255.
function createColorizer(breaks, colorRange) {
  const colors = colorRange.map(c => [
    c.r,
    c.g,
    c.b,
    Math.floor(c.opacity * 255)
  ])
  return v => {
    for (let i = 0; i < breaks.length; i++) {
      if (v <= breaks[i]) return colors[i]
    }
    return [255, 255, 255, 0]
  }
}

const negate = b => -b

export default createSelector(selectDisplayGrid, grid => {
  if (!grid) return null

  // All values are positive
  if (grid.min >= 0) {
    const values = selectRandomGridValues(grid)
    const clusters = ckmeans(values, colorRangePositive.length)
    const breaks = [0, ...findBreaks(clusters)]
    const colorRange = [zeroColor, ...colorRangePositive]

    // Ensure that the max is included. The random sampling may have missed it.
    breaks[breaks.length - 1] = grid.max

    const scale = {
      breaks,
      colorizer: createColorizer(breaks, colorRange),
      colorRange
    }
    return scale
  }

  // All values are negative
  if (grid.max <= 0) {
    const values = selectRandomGridValues(grid)
    const clusters = ckmeans(values, colorRangeNegative.length)
    const breaks = [...findBreaks(clusters), 0]
    const colorRange = [...colorRangeNegative, zeroColor]
    return {
      breaks,
      colorizer: createColorizer(breaks, colorRange),
      colorRange
    }
  }

  if (grid.max > Math.abs(grid.min)) {
    // Sample only the positive numbers
    const positiveValues = selectRandomGridValues(grid, v => v > 0)
    // Add an additional break because the cluster around 0 is transparent
    const positiveClusters = ckmeans(
      positiveValues,
      colorRangePositive.length + 1
    )
    const positiveBreaks = findBreaks(positiveClusters)

    // Ensure that the breaks include the grid.max. Random sampling may have
    // missed it.
    positiveBreaks[positiveBreaks.length - 1] = grid.max

    // Find the min bin. Iterate until a bin is found that contains the
    // absolute value of the min.
    const minBin = positiveBreaks.findIndex(b => b >= Math.abs(grid.min))
    // Slice off the end (creates new array), reverse (mutates) and negate.
    // [1, 10, 100] => [1, 10] => [10, 1] => [-10, -1]
    const negativeBreaks = positiveBreaks
      .slice(0, minBin)
      .reverse()
      .map(b => -b)

    const breaks = [...negativeBreaks, ...positiveBreaks]
    const colorRange = [
      // Less negative, less negative colors,
      ...colorRangeNegative.slice(
        -negativeBreaks.length,
        negativeBreaks.length
      ),
      zeroColor,
      ...colorRangePositive
    ]

    return {
      breaks,
      colorizer: createColorizer(breaks, colorRange),
      colorRange
    }
  }

  if (grid.max <= Math.abs(grid.min)) {
    // Sample only the negative numbers
    const negativeValues = selectRandomGridValues(grid, v => v < 0)
    // Add an additional break because the cluster around 0 is transparent
    const negativeClusters = ckmeans(
      negativeValues,
      colorRangeNegative.length + 1
    )
    // Find the breaks. If the lowest break is `[-1]`, remove it. This may
    // occur due to the grid value selection above.
    const negativeBreaks = findBreaks(negativeClusters).filter(b => b !== -1)

    // Find the max bin. Flip the breaks. Iterate until a bin is found that
    // contains the max value.
    const maxBin = negativeBreaks.findIndex(b => -b <= grid.max)

    // Slice (create a new array), negate and reverse (mutates array).
    // [-100, -10 -1] => [-10, -1] => [10, 1] => [1, 10]
    const positiveBreaks = negativeBreaks
      .slice(maxBin)
      .map(negate)
      .reverse()

    const breaks = [...negativeBreaks, ...positiveBreaks]
    const colorRange = [
      ...colorRangeNegative,
      zeroColor,
      // Less positive breaks, less positive colors
      ...colorRangePositive.slice(-positiveBreaks.length, positiveBreaks.length)
    ]

    return {
      breaks,
      colorizer: createColorizer(breaks, colorRange),
      colorRange
    }
  }
})

// Filtering out the zeros seems to give more nuanced breaks. There are a huge
// amount of zeros.
const filterZero = v => v !== 0

/**
 * Randomly sample filtered grid values.
 */
function selectRandomGridValues(grid, filter = filterZero) {
  const filtered = grid.data.filter(filter)
  if (filtered.length <= MAX_SAMPLE_SIZE) return filtered

  // Seed with the grid dimensions to sample the same points on similar grids
  const generator = new XorShift([
    grid.west,
    grid.north,
    grid.width,
    grid.height
  ])
  return sample(filtered, MAX_SAMPLE_SIZE, () => generator.random())
}

// Find the maximum values in each cluster
function findBreaks(clusters) {
  return clusters.map(c => c[c.length - 1])
}
