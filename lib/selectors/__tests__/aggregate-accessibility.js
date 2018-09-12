// @flow

// disable a few ESLint rules that choke on pretty-printed arrays below
/* eslint indent: 0, no-multi-spaces: 0 */

/** Test that the aggregate accessibility selector works correctly */

import range from 'lodash/range'

import {getAggregateAccessibility} from '../aggregate-accessibility'

const contains = (width, height) => (x, y) =>
  x >= 0 && y >= 0 && x < width && y < height

describe('Selectors > aggregation accessibility', () => {
  it('should work', () => {
    // if we think of these as population, the two right cells of the top row have population of 100 and 25
    const population = {
      contains: contains(3, 2),
      data: [
        10000,
        100,
        25, // <== aggregation area overlaps rightmost two cells
        10000,
        10000,
        10000
      ],
      height: 2,
      min: 0,
      north: 50,
      west: 49,
      width: 3,
      zoom: 9
    }

    // The aggregation area starts in the second cell of the weights and doesn't cover the lower row
    // it covers 50% of the top center (100 people) and 100% of the top right (25 people)
    const aggregationArea = {
      contains: contains(2, 1),
      data: [50000, 100000],
      height: 1,
      min: 0,
      north: 50,
      west: 50,
      width: 2,
      zoom: 9
    }

    // Accessibility starts two cells north and two cells west of aggregation area
    const accessibility = {
      contains: contains(4, 4),
      data: [
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
        1000,
        5500, // <== rightmost two overlap aggregation area
        100,
        100,
        100,
        100
      ],
      height: 4,
      min: 0,
      north: 48,
      west: 48,
      width: 4,
      zoom: 9
    }

    // okay all together now. The aggregation area covers 50% of one cell that has population 100 and
    // accessibility 1000, yielding a spike at 1000 of height 50 people, and 100% of another cell
    // with population 25 and accessibility 5500, yielding 25 people with an accessibility of 5500
    // There are fifteen bins scaled between min and max; the first bin should therefore run from 1000 to
    // 1300 and have value 50, and the final bin should run from 5700 to 5500 and have value 25.
    // all percentiles up to the 66th should have value 1000, all above value 5500.
    const aggregateAccessibility = getAggregateAccessibility(
      accessibility,
      aggregationArea,
      population
    )

    // throw an error to make flow happy if aggregateAccessibility is undefined
    if (!aggregateAccessibility) {
      throw new Error('expected aggregate accessibility to be defined')
    }

    expect(aggregateAccessibility.bins).toHaveLength(15)

    expect(aggregateAccessibility.bins[0].min).toEqual(1000)
    expect(aggregateAccessibility.bins[0].max).toEqual(1300)
    expect(aggregateAccessibility.bins[0].value).toEqual(50)

    expect(aggregateAccessibility.bins[14].min).toEqual(5200)
    expect(aggregateAccessibility.bins[14].max).toEqual(5500)
    expect(aggregateAccessibility.bins[14].value).toEqual(25)

    const expectedPercentiles = [
      0, // 0th percentile is 0 by definition
      ...range(66).map(i => 1000), // lower 2/3 of population are in lower accessibility area
      ...range(33).map(i => 5500) // upper 2/3 is in higher accessibility area
    ]

    expect(aggregateAccessibility.percentiles).toEqual(expectedPercentiles)
    expect(aggregateAccessibility.weightedAverage).toEqual(2500)
  })
})
