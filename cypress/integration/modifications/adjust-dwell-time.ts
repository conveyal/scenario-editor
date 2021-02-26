import {LatLngTuple} from 'leaflet'

import {getDefaultRegion} from '../utils'

const intersection: LatLngTuple = [39.004, -84.621]
const northEastCorner: LatLngTuple = [39.1, -84.509]
const north = 39.031
const east = -84.605
const west = -84.673
const south = 38.964

describe('Adjust Dwell Time', () => {
  const region = getDefaultRegion()
  const project = region.getProject('Adjust Dwell Tests')

  const mod = project.getModification({
    type: 'Adjust Dwell Time',
    data: {
      // reset
      scale: false,
      stops: null,
      trips: null,
      value: 300
    }
  })

  before(() => {
    mod.navTo()
    cy.findButton(/New/).click()
    cy.clickMapAtCoord([north, west])
    cy.clickMapAtCoord([north, east])
    cy.clickMapAtCoord([south, east])
    cy.clickMapAtCoord([south, west])
    cy.clickMapAtCoord([north, west])
  })

  it('should have lower accessibility for an increased dwell time', () => {
    region.setupAnalysis({project})
    region
      .fetchAccessibilityComparison(intersection)
      .should(([a, c]) => expect(a).to.be.lessThan(c))

    cy.setTimeCutoff(30)
    region
      .fetchAccessibilityComparison(northEastCorner)
      .should(([a, c]) => expect(a).to.equal(c))
  })
})
