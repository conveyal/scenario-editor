import {LatLngTuple} from 'leaflet'

import {getDefaultRegion, scratchRegion} from '../utils'

const intersection: LatLngTuple = [39.004, -84.621]
const northEastCorner: LatLngTuple = [39.1, -84.509]

// Region bounds
const {bounds} = scratchRegion

// This polygon should select 2 stops
const north = 39.015
const east = -84.603
const west = -84.606
const south = 39.013

const selectSquare = (n: number, e: number, s: number, w: number) => {
  cy.clickMapAtCoord([n, w])
  cy.clickMapAtCoord([n, e])
  cy.clickMapAtCoord([s, e])
  cy.clickMapAtCoord([s, w])
  cy.clickMapAtCoord([n, w])
}

const scenarios = ['Full Increase', 'Single Stop Increase']

/**
 * This set currently only tests increasing the dwell time to a specific value.
 * TODO: Use a base GTFS feed that includes dwell times so that we can test scaling and decreasing.
 */
describe('Adjust Dwell Time', () => {
  const region = getDefaultRegion()
  const project = region.getProject('Adjust Dwell Tests')
  project.getScenarios(scenarios)

  const fullRouteIncrease = project.getModification({
    name: 'Full Route Increase',
    type: 'Adjust Dwell Time',
    data: {
      // reset
      scale: false,
      stops: null,
      trips: null,
      value: 600,
      variants: [true, true, false]
    }
  })

  const singleStopIncrease = project.getModification({
    name: 'Single Stop Increase',
    type: 'Adjust Dwell Time',
    data: {
      // reset
      scale: false,
      stops: null,
      trips: null,
      value: 600,
      variants: [true, false, true]
    }
  })

  before(() => {
    fullRouteIncrease.navTo()
    cy.selectRoute('Dixie')
    cy.findButton(/New/).click()
    selectSquare(bounds.north, bounds.east, bounds.south, bounds.west)

    singleStopIncrease.navTo()
    cy.selectRoute('Dixie')
    cy.findButton(/New/).click()
    selectSquare(north, east, south, west)
  })

  it('should have lower accessibility for an increased dwell time', () => {
    region.setupAnalysis({project, scenario: scenarios[0]})
    region
      .fetchAccessibilityComparison(intersection)
      .should(([a, c]) => expect(a).to.be.lessThan(c))

    region.setupAnalysis({project, scenario: scenarios[1]})
    region
      .fetchAccessibilityComparison(intersection)
      .should(([a, c]) => expect(a).to.be.lessThan(c))
  })

  it('should have lower accessibility full route increase', () => {
    region.setupAnalysis(
      {project, scenario: scenarios[0]},
      {project, scenario: scenarios[1]}
    )
    region
      .fetchAccessibilityComparison(intersection)
      .should(([a, c]) => expect(a).to.be.lessThan(c))

    region.setupAnalysis(
      {project, scenario: scenarios[0]},
      {project, scenario: scenarios[1]}
    )
    cy.setTimeCutoff(30)
    region
      .fetchAccessibilityComparison(northEastCorner)
      .should(([a, c]) => expect(a).to.be.equal(c))
  })

  describe.skip('Decrease', () => {
    const decreaseDwell = project.getModification({
      name: 'Decrease Dwell Time',
      type: 'Adjust Dwell Time',
      data: {
        // reset
        scale: false,
        stops: null,
        trips: null,
        value: 0,
        variants: [true, false, true]
      }
    })

    before(() => {
      decreaseDwell.navTo()
      cy.selectRoute('Dixie')
      cy.findButton(/New/).click()
      selectSquare(north, east, south, west)
    })

    /**
     * Multiple Adjust Dwell Time modifications cannot be to the same stops?
     * it('should have a higher accessibility with the single stop decrease', () => {
     *   region.setupAnalysis({project, scenario: 'Default'}, {project, scenario: 'Increase'})
     *   region
     *     .fetchAccessibilityComparison(intersection)
     *     .should(([a, c]) => expect(a).to.be.lessThan(c))
     * })
     */

    it('should have no differnce far away from the decrease', () => {
      region.setupAnalysis(
        {project, scenario: 'Default'},
        {project, scenario: 'Increase'}
      )
      cy.setTimeCutoff(30)
      region
        .fetchAccessibilityComparison(northEastCorner)
        .should(([a, c]) => expect(a).to.equal(c))
    })
  })
})
