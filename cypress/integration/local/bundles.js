context('GTFS bundles', () => {
  before('prepare the region', () => {
    cy.fixture('regions/scratch.json').as('region')
    cy.setupRegion('scratch')
  })

  it('can be uploaded with single feed', function() {
    cy.findByTitle('GTFS Bundles').click({force: true})
    cy.findByText(/Create a bundle/).click()
    cy.location('pathname').should('match', /.*\/bundles\/create$/)
    cy.findByLabelText(/Bundle Name/i).type('single GTFS bundle')
    cy.fixture(this.region.GTFSfile, {encoding: 'base64'}).then(fileContent => {
      cy.get('input[type="file"]').upload({
        encoding: 'base64',
        fileContent,
        fileName: this.region.GTFSfile,
        mimeType: 'application/octet-stream'
      })
    })
    cy.findByRole('button', {name: /Create/i}).click()
    cy.findByText(/Processing/)
    cy.location('pathname', {timeout: 30000}).should('match', /\/bundles$/)
    // TODO verify the upload is selectable from the dropdown
  })
})
