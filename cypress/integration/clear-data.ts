describe('Clear all test data', () => {
  before(() => {
    cy.window().then((win) => win.localStorage.clear())
  })

  it('should have no data in local storage', () => {
    cy.window()
      .then((win) => !!win.localStorage.getItem('localModelPaths'))
      .should('be.false')
  })

  // TODO add database clearing section
})
