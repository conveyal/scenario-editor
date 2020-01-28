describe('Set up a new region', function() {
  before(function() {
    cy.login()
  })

  it('open "new region" page', function() {
    cy.visit('/')
    cy.contains('Set up a new region').click()
    // has form
    cy.get('input[name="Region Name"]')
  })

  it('search for map location by name', function() {
    cy.visit('/regions/create')
    cy.mapIsReady()
    // try searching all selected regions
    return cy.fixture('regions.json').then(JSON => {
      cy.wrap(JSON.regions).each(region => {
        cy.get('input#react-select-2-input')
          .focus()
          .clear()
          .type(region.searchTerm)
        cy.contains(region.foundName).click({force: true})
        cy.screenshot(region.searchTerm + '-search-result.png')
      })
    })
  })

  it('enter valid and invalid coordinates', () => {
    cy.visit('/regions/create')
    // coordinate inputs must be valid
    // TODO not finished
    cy.get('input[name="North bound"]')
      .clear()
      .type(45.769)
    cy.get('a[name="Set up a new region"]').should('have.attr', 'disabled')
  })

  it('select pbf', () => {
    cy.visit('/regions/create')
    cy.get('input[type=file]')
    // TODO file uploads seem difficult with Cypress..
    // see: https://www.npmjs.com/package/cypress-file-upload
  })
})
