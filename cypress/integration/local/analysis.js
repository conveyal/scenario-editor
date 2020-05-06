context('Analysis', () => {
  before(() => {
    cy.setupProject('scratch')
    cy.navTo('Analyze')
    cy.get('div.leaflet-container').as('map')
  })

  it('runs baseline single point analysis', function () {
    cy.findByLabelText(/^Project$/)
      .click({force: true})
      .type('scratch{enter}')
    cy.contains('scratch project')
    cy.findByLabelText(/^Scenario$/)
      .click({force: true})
      .type('baseline{enter}')
    cy.contains('Baseline')
    cy.findByText(/Isochrone as GeoJSON/i).should('not.exist')
    // TODO interaction. For now use default position
    cy.get('@map').get('.leaflet-marker-icon')
    cy.findByText(/Fetch Results/i).click()
    cy.findByText(/Isochrone as GeoJSON/i, {timeout: 60000}).should('exist')
    cy.get('@map').matchImageSnapshot('post')
  })
})
