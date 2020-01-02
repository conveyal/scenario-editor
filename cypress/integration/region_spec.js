describe('Set up a new region', () => {
  before(() => {
    cy.login()
  })

  it('open new region page', () => {
    cy.visit('/')
    cy.contains('Set up a new region').click()
    cy.get('input[name="Region Name"]')
  })

  it('search for new region locations', () => {
    // try several selected region
    cy.fixture('regions.json').then(regions => {
      regions.forEach(region => {
        // TODO not working - element hidden
        cy.get('input#react-select-2-input').type(region.searchTerm)
        cy.contains(region.foundName)
      })
    })
  })

  it('enter values', () => {
    cy.get('input[name="Region Name"]').type('Temporary region')
    cy.get('input[name="Description"]').type('this should be deleted shortly')
  })
})
