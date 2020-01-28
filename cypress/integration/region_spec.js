describe('Set up a new region', () => {
  before(() => {
    cy.login()
  })

  it('open "new region" page', () => {
    cy.visit('/')
    cy.contains('Set up a new region').click()
    // has form
    cy.get('input[name="Region Name"]')
    cy.get('div.leaflet-container')
    // has map loaded
    // TODO STILL not working...
    cy.waitUntil(
      () =>
        cy.window({log: false}).then(w => typeof w.LeafletMap !== 'undefined'),
      {timeout: 10000, description: 'Map Global is available'}
    )
    cy.window().then(w => {
      console.log(w.LeafletMap)
    })
  })

  it('search for map location by name', () => {
    // try searching all selected regions
    cy.fixture('regions.json').then(JSON => {
      JSON.regions.forEach(region => {
        cy.get('input#react-select-2-input')
          .focus()
          .clear()
          .type(region.searchTerm)
        cy.contains(region.foundName).click({force: true})
        cy.window().then(w => {
          console.log('center is ' + w.LeafletMap.getCenter())
        })
        cy.screenshot(region.searchTerm + '-search-result.png')
      })
    })
  })

  it('enter valid and invalid coordinates', () => {
    // coordinate inputs must be valid
    // TODO not finished
    cy.get('input[name="North bound"]')
      .clear()
      .type(45.769)
    cy.get('a[name="Set up a new region"]').should('be.disabled')
  })

  //  it('enter region descriptors', () => {
  //    // name and decription
  //    cy.get('input[name="Region Name"]').type('Temporary region')
  //    cy.get('input[name="Description"]').type('this should be deleted shortly')
  //  })

  it('select pbf', () => {
    cy.get('input[type=file]')
    // TODO file uploads seem difficult with Cypress..
    // see: https://www.npmjs.com/package/cypress-file-upload
  })
})
