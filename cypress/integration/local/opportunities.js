describe('Opportunities', () => {
  before(() => {
    cy.setupRegion('scratch')
  })

  beforeEach(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.navTo(/Opportunity datasets/i)
  })

  it('can be uploaded as CSV', function () {
    let oppName = 'opp ' + Date.now()
    cy.findByText(/Upload a new dataset/i).click()
    cy.location('pathname').should('match', /\/opportunities\/upload$/)
    cy.findByPlaceholderText(/^Opportunity dataset/i).type(oppName)
    cy.fixture(this.region.opportunityCSV).then((fileContent) => {
      cy.findByLabelText(/^Select opportunity dataset/i).upload({
        fileContent,
        fileName: this.region.opportunityCSV,
        mimeType: 'text/csv',
        encoding: 'utf-8'
      })
    })
    cy.findByLabelText(/Latitude/).type('lat')
    cy.findByLabelText(/Longitude/).type('lon')
    cy.get('a.btn')
      .contains(/Upload/)
      .should('not.be.disabled')
      .click()
    cy.location('pathname').should('match', /opportunities$/)
    cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout: 10000})
    cy.findByText(/Select\.\.\./)
      .click()
      .type(`${oppName}{enter}`)
    cy.contains(/Delete entire dataset/i).click()
    // TODO need to finish by checking that the upload:
    // has only the one numeric field
    // can be seen on the map
    // can be deleted
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
