import {getDefaultRegion} from '../utils'

/**
 * Select custom origin point sets.
 */
describe('Regional > Custom Origins', () => {
  const region = getDefaultRegion()
  const hospitals = region.getFreeformDataset(
    'Hospitals',
    'regions/nky/hospitals.csv',
    'name'
  )
  const customOriginAnalysis = region.getRegionalAnalysis('Custom Origin', {
    originPointSet: hospitals.name
  })

  it('should run a regional analysis with custom origins', () => {
    customOriginAnalysis.navTo()
    cy.findButton(/Download results/).click()
    cy.findByText(/GeoTIFF/).should('be.disabled')
    cy.findByText(/Access CSV/).should('be.enabled')
    // .click() Disabled. Will crash Cypress for now.
  })
})
