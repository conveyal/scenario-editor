context('Scenarios', () => {
  before(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.setupProject('scratch')
    // open the panel
    cy.findByText(/Scenarios/)
      .parent()
      .as('scenarioPanel')
    cy.get('@scenarioPanel').click()
  })

  beforeEach(() => {
    cy.findByText(/Scenarios/)
      .parent()
      .as('scenarioPanel')
  })

  it('include baseline', () => {
    cy.get('@scenarioPanel')
      .contains(/Baseline/)
      .findByTitle(/Delete this scenario/)
      .should('not.exist')
  })

  it('can be created and deleted', function() {
    let scenarioName = 'scenario ' + Date.now()
    // stub the prompt
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns(scenarioName)
    })
    // create
    cy.findByRole('link', {name: 'Create a scenario'}).click()
    // confirm creation and delete
    cy.get('@scenarioPanel')
      .contains(scenarioName)
      .findByTitle(/Delete this scenario/)
      .click()
    cy.findByText(scenarioName).should('not.exist')
  })

  it('can be created and renamed', () => {
    // TODO
  })
})
