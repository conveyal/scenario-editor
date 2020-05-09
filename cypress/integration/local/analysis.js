context('Single point analysis', () => {
  before(() => {
    cy.setupProject('scratch')
    cy.navTo('Analyze')
    cy.get('div.leaflet-container').as('map')
  })

  it('of baseline network looks reasonable', function () {
    // select project and scenario
    cy.findByLabelText(/^Project$/)
      .click({force: true})
      .type('scratch{enter}')
    cy.contains('scratch project')
    cy.findByLabelText(/^Scenario$/)
      .click({force: true})
      .type('baseline{enter}')
    cy.contains('Baseline')
    // start analysis from default marker position
    cy.findByText(/Fetch Results/i).click()
    cy.findByText(/Isochrone as GeoJSON/i, {timeout: 20000}).should('exist')
    // move the marker and re-run
    cy.mapMoveMarkerTo([39.08877, -84.5106]) // to transit center
    cy.findByText(/Fetch Results/i).click()
    //cy.get('@map').matchImageSnapshot('post')
  })
})
