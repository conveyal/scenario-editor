describe('Opportunities', () => {
  before(() => {
    cy.setupRegion('scratch')
  })

  beforeEach(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.navTo(/Opportunity datasets/i)
  })

  it('can be uploaded as CSV', function () {
    let opportunity = this.region.opportunities.csv

    let oppName = 'opp ' + Date.now()
    cy.findByText(/Upload a new dataset/i).click()
    cy.location('pathname').should('match', /\/opportunities\/upload$/)
    cy.findByPlaceholderText(/^Opportunity dataset/i).type(oppName)
    cy.fixture(opportunity.file).then((fileContent) => {
      cy.findByLabelText(/^Select opportunity dataset/i).upload({
        fileContent,
        fileName: opportunity.file,
        mimeType: 'text/csv',
        encoding: 'utf-8'
      })
    })
    cy.findByLabelText(/Latitude/).type(opportunity.latitudeField)
    cy.findByLabelText(/Longitude/).type(opportunity.longitudeField)
    cy.get('a.btn')
      .contains(/Upload/)
      .should('not.be.disabled')
      .click()
    cy.location('pathname').should('match', /opportunities$/)
    // find the alert showing this upload is complete and close it
    cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout: 10000})
      .parent()
      .parent()
      .findByRole('button', /x/)
      .click()
    //
    cy.findByText(/Select\.\.\./)
      .click()
      .type(`${oppName}{enter}`)
    cy.contains(/Delete entire dataset/i).click()
    // TODO need to finish by checking that the upload:
    // has only the numeric fields
    // can be seen on the map
  })

  it('can be imported from LODES', function () {
    // TODO
    //cy.findByText(/Fetch LODES/i).click()
    // Error on the server - Cannot download LODES in offline mode.
  })

  it('can be uploaded as shapefile', function () {
    // TODO
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
