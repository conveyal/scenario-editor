const tempPrefix = Cypress.env('dataPrefix') + 'temp'
const createTempRegionName = () => tempPrefix + Date.now()

const getName = () => cy.findByLabelText(/Region Name/)
const getDesc = () => cy.findByLabelText(/Description/)
const getNorth = () => cy.findByLabelText(/North bound/)
const getSouth = () => cy.findByLabelText(/South bound/)
const getEast = () => cy.findByLabelText(/East bound/)
const getWest = () => cy.findByLabelText(/West bound/)
const getCreate = () => cy.findButton(/Set up a new region/)
const getSave = () => cy.findButton(/Save changes/)
const getSearch = () => cy.get('#geocoder')

/**
 * Scratch region
 */
const regionData = {
  description: 'Cypress stratch testing region',
  searchTerm: 'covington kentucky',
  foundName: 'Covington, Kentucky, United States',
  north: 39.1199,
  south: 38.9268,
  east: -84.3592,
  west: -84.706,
  center: [39.02335, -84.5326] as L.LatLngTuple
}

/**
 * Manipulate the coordinate inputs to ensure proper behavior
 */
function testInvalidCoordinates() {
  // try to set south == north
  getNorth()
    .itsNumericValue()
    .then((northVal) => {
      getSouth().clear().type(`${northVal}`).blur()
      cy.wait(10) // eslint-disable-line
      getSouth().itsNumericValue().should('be.lt', northVal)
    })
  // try to set east < west
  getEast()
    .itsNumericValue()
    .then((eastVal) => {
      getWest()
        .clear()
        .type(`${eastVal + 1}`)
        .blur()
      cy.wait(10) // eslint-disable-line
      getWest().itsNumericValue().should('be.lt', eastVal)
    })
  // try to enter a non-numeric value
  // form should revert to previous numeric value
  getWest().clear().type('letters').blur()
  cy.wait(10) // eslint-disable-line
  getWest().itsNumericValue().should('not.be.NaN')
}

/**
 * Delete the currently open region. Must be already on the region settings page.
 */
function deleteThisRegion() {
  // Delete region
  cy.findButton(/Delete this region/).click()
  cy.findButton(/Confirm/).click()
  cy.findByRole('dialog').should('not.exist')
}

/**
 * Clean up any temp regions created by this file that were not deleted.
 * Useful for local development and running of tests.
 */
function deleteOldScratchRegions() {
  cy.visitHome()
  return cy
    .get('body')
    .then(($body) =>
      $body
        .find('button')
        .filter((_, el) => Cypress.$(el).text().startsWith(tempPrefix))
    )
    .then((regions) => {
      if (regions.length > 0) {
        cy.wrap(regions[0]).click()
        cy.findButton(/Edit region settings/).click()
        deleteThisRegion()
        deleteOldScratchRegions()
      }
    })
}

describe('Regions', () => {
  before(() => deleteOldScratchRegions())

  it('CRUD', function () {
    cy.findButton('Set up a new region').click()
    cy.location('pathname').should('eq', '/regions/create')

    // Test invalid coordinates in the create form
    testInvalidCoordinates()

    // Test geocoder search
    const testLocations = [
      {
        searchTerm: 'cincinnati ohio usa',
        findText: /^Cincinnati, Ohio/,
        coord: [39.1, -84.5]
      },
      {
        searchTerm: 'tulsa oklahoma usa',
        findText: /^Tulsa, Oklahoma/,
        coord: [36.1, -95.9]
      }
    ]
    const maxOffset = 10000 // meters
    testLocations.forEach((r) => {
      getSearch().focus().clear().type(r.searchTerm)
      cy.findByText(r.findText).click()
      cy.mapCenteredOn(r.coord as L.LatLngTuple, maxOffset)
    })

    // Create a region
    const regionName = createTempRegionName()
    // Enter region name and description
    getName().type(regionName)
    getDesc().type(regionData.description)
    // search for region by name
    getSearch().focus().clear().type(regionData.searchTerm)
    cy.findByText(regionData.foundName).click()
    cy.mapCenteredOn(regionData.center, 10000)
    // Enter exact coordinates
    getNorth()
      .clear()
      .type(regionData.north + '')
    getSouth()
      .clear()
      .type(regionData.south + '')
    getEast()
      .clear()
      .type(regionData.east + '')
    getWest()
      .clear()
      .type(regionData.west + '')
    // Create the region
    getCreate().click()
    cy.navComplete()
    // should redirect to a region with no bundles
    cy.location('pathname').should('match', /regions\/.{24}$/)
    cy.contains('Upload a new Network Bundle')
    // Region is listed in main regions menu
    cy.navTo('regions')
    cy.findByText(regionName).click()
    cy.navComplete()
    cy.location('pathname').should('match', /regions\/.{24}$/)
    // region settings are saved correctly
    cy.findButton(/Edit region settings/).click()
    // check setting values
    getName().should('have.value', regionName)
    getDesc().should('have.value', regionData.description)
    // coordinate values are rounded to match analysis grid
    getNorth().itsNumericValue().isWithin(regionData.north, 0.02)
    getSouth().itsNumericValue().isWithin(regionData.south, 0.02)
    getEast().itsNumericValue().isWithin(regionData.east, 0.02)
    getWest().itsNumericValue().isWithin(regionData.west, 0.02)
    cy.mapCenteredOn(regionData.center, 10000)
    getSave().should('be.disabled')

    // Run the coordinate tests on the edit page
    testInvalidCoordinates()

    // update something and verify save
    const newDescription = 'This text has just been updated!'
    const newName = createTempRegionName()
    getDesc().clear().type(newDescription)
    getName().clear().type(newName)
    getSave().should('be.enabled').click()
    cy.navTo('regions')
    cy.findButton(newName).click()
    cy.navComplete()
    cy.findButton(/Edit region settings/).click() // will go to bundle page otherwise
    getDesc().should('have.value', newDescription)
    getName().should('have.value', newName)

    // From region settings
    deleteThisRegion()

    // should go back to home page
    cy.location('pathname').should('eq', '/')
    cy.contains('Set up a new region')
    cy.findToast().should('not.exist')
    cy.findButton(newName).should('not.exist')
  })
})
