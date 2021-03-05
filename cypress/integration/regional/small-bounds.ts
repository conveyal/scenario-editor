import {getDefaultRegion} from '../utils'

/**
 * Produce results even when bounds are small.
 */
describe('Regional > Small bounds', () => {
  const region = getDefaultRegion()
  const regionalAnalysis = region.getRegionalAnalysis('Small Bounds', {
    settings: {
      bounds: {
        // These bounds will produce two grid origins.
        north: 38.9577,
        east: -84.3969,
        south: 38.957,
        west: -84.3966
      }
    }
  })

  it('should open the regional analysis without errors and load the grids', () => {
    regionalAnalysis.navTo()
    cy.findByText('Loading grids...').should('not.exist')
  })

  after(() => regionalAnalysis.delete())
})
