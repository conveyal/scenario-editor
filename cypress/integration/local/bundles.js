describe('Network bundles', () => {
  before('prepare the region', () => {
    cy.setup('region')
    cy.setup('bundle')
  })

  beforeEach(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.navTo('Network Bundles')
  })

  it('with single feed can be uploaded and deleted', function () {
    let bundleName = Cypress.env('dataPrefix') + ' temp bundle ' + Date.now()
    cy.findByText(/Create a new network bundle/).click()
    cy.location('pathname').should('match', /.*\/bundles\/create$/)
    cy.findByLabelText(/Bundle Name/i).type(bundleName)
    cy.findByText(/Upload new OpenStreetMap/i).click()
    cy.findByLabelText(/Select PBF file/i).attachFile({
      filePath: this.region.PBFfile,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findByText(/Upload new GTFS/i).click()
    cy.findByLabelText(/Select .*GTFS/i).attachFile({
      filePath: this.region.GTFSfile,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findByRole('button', {name: /Create/i}).click()
    cy.findByText(/Processing/)
    cy.location('pathname', {timeout: 60000}).should(
      'match',
      /.*\/bundles\/.{24}$/
    )
    // confirm that the bundle was saved
    cy.contains('or select an existing one')
    cy.location('pathname').should('match', /.*bundles\/.{24}$/)
    cy.findByPlaceholderText(/Bundle name/i)
      .invoke('val')
      .then((name) => {
        expect(name).to.equal(bundleName)
      })
    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .then((name) => {
        expect(name).to.equal(this.region.feedAgencyName)
      })
    cy.findByLabelText(/Feed #2/).should('not.exist')
    cy.findByText(/Delete this network bundle/i).click()
    cy.findByRole('alertdialog', 'Confirm')
      .findByRole('button', {name: /Delete/})
      .click()
    cy.location('pathname').should('match', /.*\/bundles$/)
    cy.findByText(/Select.../).click()
    cy.contains(bundleName).should('not.exist')
  })

  it('can reuse OSM and GTFS components', function () {
    let bundleName = Cypress.env('dataPrefix') + 'temp bundle ' + Date.now()
    cy.findByText(/Create a new network bundle/).click()
    cy.location('pathname').should('match', /.*\/bundles\/create$/)
    cy.findByLabelText(/Bundle Name/i).type(bundleName)
    cy.findByText(/Reuse existing OpenStreetMap/i).click()
    cy.findByText(/network bundle to reuse OSM from/i)
      .parent()
      .select(Cypress.env('dataPrefix') + 'scratch bundle')
    cy.findByText(/Reuse existing GTFS/i).click()
    cy.findByText(/network bundle to reuse GTFS from/i)
      .parent()
      .select(Cypress.env('dataPrefix') + 'scratch bundle')
    cy.findByRole('button', {name: /Create/})
      .should('not.be.disabled')
      .click()
      .contains('Processing')
      .should('exist')
      .contains('Processing', {timeout: 30000})
      .should('not.exist')
    cy.location('pathname').should('match', /\/bundles\/.{24}$/)
    //cy.findByLabelText(/Network bundle name/).invoke('val').then(val =>{
    //  expect(val).to.eq(bundleName)
    //})
    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .then((val) => {
        expect(val).to.eq(this.region.feedAgencyName)
      })
    cy.findByText(/Delete this network bundle/i).click()
    cy.findByRole('alertdialog', 'Confirm')
      .findByRole('button', {name: /Delete/})
      .click()
    cy.location('pathname').should('match', /.*\/bundles$/)
  })

  it('rejects obviously corrupt GTFS', function () {
    const bundleName =
      Cypress.env('dataPrefix') + ' corrupt bundle ' + Date.now()
    cy.findByText(/Create a new network bundle/).click()
    cy.findByLabelText(/Bundle Name/i).type(bundleName)
    cy.findByText(/Reuse existing OpenStreetMap/i).click()
    cy.findByText(/network bundle to reuse OSM from/i)
      .parent()
      .select(Cypress.env('dataPrefix') + 'scratch bundle')
    cy.findByText(/Upload new GTFS/i).click()
    cy.findByLabelText(/Select .*GTFS/i).attachFile({
      filePath: this.region.corruptGTFSfile,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findByRole('button', {name: /Create/i}).click()
    cy.findByText(/Wait until processing is complete/)
    cy.findByText(/error/i, {timeout: 20000}).should(
      'have.attr',
      'role',
      'alert'
    )
    cy.navTo('Network Bundles')
    // TODO need semantic selector for dropdown
    cy.findByText('Select...').click().type('ERROR{enter}')
    cy.contains(bundleName)
    cy.findByRole('alert').contains(
      'Please upload valid OSM .pbf and GTFS .zip files.'
    )
    cy.findByRole('button', {name: /delete/i}).click()
    cy.findByRole('alertdialog', 'Confirm')
      .findByRole('button', {name: /Delete/})
      .click()
  })

  it('with multiple GTFS feeds can be uploaded', function () {
    const bundleName =
      Cypress.env('dataPrefix') + ' double bundle ' + Date.now()
    cy.findByText(/Create a new network bundle/).click()
    cy.findByLabelText(/Bundle Name/i).type(bundleName)
    cy.findByText(/Reuse existing OpenStreetMap/i).click()
    cy.findByText(/network bundle to reuse OSM from/i)
      .parent()
      .select(Cypress.env('dataPrefix') + 'scratch bundle')
    cy.findByText(/Upload new GTFS/i).click()
    cy.findByLabelText(/Select .*GTFS/i)
      .attachFile({
        filePath: this.region.GTFSfile,
        encoding: 'base64',
        mimeType: 'application/octet-stream'
      })
      .attachFile({
        filePath: this.region.GTFSfile,
        encoding: 'base64',
        mimeType: 'application/octet-stream'
      })
    cy.findByRole('button', {name: /Create/i}).click()
    cy.location('pathname', {timeout: 60000}).should(
      'match',
      /.*\/bundles\/.{24}$/
    )
    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .then((name) => {
        expect(name).to.equal(this.region.feedAgencyName)
      })
    cy.findByLabelText(/Feed #2/)
      .invoke('val')
      .then((name) => {
        expect(name).to.equal(this.region.feedAgencyName)
      })
    cy.findByLabelText(/Feed #3/).should('not.exist')
    cy.findByText(/Delete this network bundle/i).click()
    cy.findByRole('alertdialog', 'Confirm')
      .findByRole('button', {name: /Delete/})
      .click()
    cy.location('pathname').should('match', /.*\/bundles$/)
    cy.findByText(/Select.../).click()
    cy.contains(bundleName).should('not.exist')
  })
})
