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
        cy.get('input#react-select-2-input').focus()
          .type('{selectall}{backspace}')
          .type(region.searchTerm)
        cy.contains(region.foundName).click({force:true})
      })
    })
  })

  it('enter values', () => {
    cy.get('input[name="Region Name"]').type('Temporary region')
    cy.get('input[name="Description"]').type('this should be deleted shortly')
  })
})
