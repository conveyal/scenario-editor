context('Projects', () => {
  before('prepare the region and bundle', () => {
    cy.fixture('regions/scratch.json').as('region')
    cy.setupBundle('scratch')
  })

  it('can be created', function() {
    cy.findByTitle('Projects').click({force: true})
    cy.findByText(/Create new Project/i).click()
    cy.location('pathname').should('match', /create-project/)
    cy.findByLabelText(/Project name/).type('single-GTFS project')
    // hack to select first GTFS from dropdown
    cy.findByLabelText(/Associated GTFS bundle/i)
      .click()
      .type('{downarrow}{enter}')
    cy.get('a.btn')
      .contains(/Create/)
      .click()
    cy.location('pathname').should('match', /regions\/.{24}\/projects\/.{24}/)
    cy.contains(/Modifications/)
  })
})
