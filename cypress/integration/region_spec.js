describe('Set up a new region', () => {
  before(() => {
    cy.login()
  })

  it('open new region page', () => {
    cy.visit('/')
    cy.contains('Set up a new region').click()
    cy.get('input[name="Region Name"]')
  })

  it('search for several locations by name', () => {
    // try searching all selected regions
    cy.fixture('regions.json').then(JSON => {
      JSON.regions.forEach(region => {
        cy.get('input#react-select-2-input').focus()
          .type('{selectall}{backspace}')
          .type(region.searchTerm)
        cy.contains(region.foundName).click({force:true})
        // TODO check that the map moves
        cy.wait(2000)
        cy.screenshot(region.searchTerm+'-search-result.png')
      })
    })
  })

  it('enter valid and invalid coordinates', ()=>{
    // coordinate inputs must be valid
    cy.get('input[name="North bound"]')
  })

  it('enter region descriptors', () => {
    // name and decription
    cy.get('input[name="Region Name"]').type('Temporary region')
    cy.get('input[name="Description"]').type('this should be deleted shortly')
  })

  it('select pbf', () => {
    cy.get('input[type=file]')
    // TODO file uploads seem difficult with Cypress..
    // see: https://www.npmjs.com/package/cypress-file-upload
  })
})
