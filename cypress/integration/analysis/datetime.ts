import {LatLngTuple} from 'leaflet'

import {
  defaultAnalysisSettings,
  getDefaultRegion,
  scratchRegion
} from '../utils'

describe('Analysis Dates', () => {
  const region = getDefaultRegion()

  before(() => {
    cy.visitHome()
  })

  it('should have a higher accessibility on a weekday', () => {
    region.setupAnalysis(
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          date: scratchRegion.date
        }
      },
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          date: scratchRegion.weekendDate
        }
      }
    )

    region
      .fetchAccessibilityComparison(
        scratchRegion.locations.center as LatLngTuple
      )
      .should(([weekday, weekend]) => {
        expect(weekday).to.be.greaterThan(weekend)
      })
  })

  it('should have a higher accessibility during peak hours', () => {
    region.setupAnalysis(
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          fromTime: 25_200, // 07:00
          toTime: 32_400 // 09:00
        }
      },
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          fromTime: 71_100, // 19:45
          toTime: 78_300 // 21:45
        }
      }
    )

    region
      .fetchAccessibilityComparison(
        scratchRegion.locations.center as LatLngTuple
      )
      .should(([peak, offPeak]) => {
        expect(peak).to.be.greaterThan(offPeak)
      })
  })
})
