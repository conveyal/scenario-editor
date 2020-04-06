context('Scenarios', () => {
  before('prepare a, region, bundle, & project', () => {
    cy.fixture('regions/scratch.json').as('region')
    cy.setupProject('scratch')
  })

  it('can be created', function() {
    cy.findByText('Scenarios').click()
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('Temp scenario')
      cy.findByRole('link', {name: 'Create a scenario'}).click()
    })
    cy.contains('Temp scenario')
  })

  it('can be deleted', () => {
    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true)
      cy.findByText(/Temp scenario/)
        .findByTitle(/Delete this scenario/)
        .click()
    })
    cy.findByText(/Temp scenario/).should('not.exist')
  })

  it('can be renamed', () => {
    // TODO this can break when reusing a project
    // (ie the scenario has already been renamed)
    // default scenario name is "Default"
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('Scenario 1')
      cy.findByText(/Default/)
        .findByTitle(/Rename this scenario/)
        .click()
    })
    cy.contains(/Scenario 1/)
  })
})
