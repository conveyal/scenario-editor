describe('Basic', () => {
  before(() => {
    cy.login()
  })

  it('should load the home page and go to the first region', function() {
    cy.visit('/')
    cy.get('a.list-group-item')
      .first()
      .click()
    cy.get('legend')
  })
})
