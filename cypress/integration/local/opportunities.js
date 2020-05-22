describe('Opportunities', () => {
  before(() => {
    cy.setupRegion('scratch')
  })

  beforeEach(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.navTo(/Opportunity datasets/i)
    cy.get('div.leaflet-container').as('map')
  })

  it('can be uploaded as CSV', function () {
    let opportunity = this.region.opportunities.csv
    let oppName = opportunity.name + ' ' + Date.now()
    let expectedFieldCount = 1 + opportunity.numericFields.length
    cy.findByText(/Upload a new dataset/i).click()
    cy.location('pathname').should('match', /\/opportunities\/upload$/)
    cy.findByPlaceholderText(/^Opportunity dataset/i).type(oppName)
    cy.fixture(opportunity.file).then((fileContent) => {
      cy.findByLabelText(/^Select opportunity dataset/i).upload({
        fileContent,
        fileName: opportunity.file,
        mimeType: 'text/csv'
      })
    })
    cy.findByLabelText(/Latitude/).type(opportunity.latitudeField)
    cy.findByLabelText(/Longitude/).type(opportunity.longitudeField)
    cy.get('a.btn')
      .contains(/Upload/)
      .should('not.be.disabled')
      .click()
    cy.location('pathname').should('match', /opportunities$/)
    // find the message showing this upload is complete
    cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout: 10000})
      .parent()
      .parent()
      .as('notice')
    // cheech number of fields uploaded
    cy.get('@notice').contains(
      `Finished uploading ${expectedFieldCount} features`
    )
    // close the message
    cy.get('@notice').findByRole('button', /x/).click()
    // select in the dropdown
    cy.findByText(/Select\.\.\./)
      .click()
      .type(`${oppName}: ${opportunity.numericFields[0]} {enter}`)
    // look at the map
    //cy.waitForMapToLoad()
    //cy.get('@map').matchImageSnapshot('csv-' + opportunity.name)
    //
    cy.contains(/Delete entire dataset/i).click()
  })

  it('can be uploaded as shapefile', function () {
    let opportunity = this.region.opportunities.shapefile
    let oppName = opportunity.name + ' ' + Date.now()
    //let expectedFieldCount = opportunity.numericFields.length
    cy.findByText(/Upload a new dataset/i).click()
    cy.location('pathname').should('match', /\/opportunities\/upload$/)
    cy.findByPlaceholderText(/^Opportunity dataset/i).type(oppName)
    cy.findByLabelText(/Select opportunity dataset/)
  })

  it('can be uploaded as grid', function () {
    // TODO
  })

  it('can be downloaded as grid', function () {
    // TODO
  })

  it('can be downloaded as tiff', function () {
    // TODO
  })

  after(() => {
    cy.log('after!')
    // TODO probably will want to clean up here and delete anything imported
  })
})
