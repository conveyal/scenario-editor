describe('Set up a new region', () => {
  beforeEach(() => {
    // load stratch fixture
    cy.fixture('regions/scratch.json').as('scratchRegion')
    // visit the region creation page
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    cy.location('pathname').should('eq', '/regions/create')
    // TODO hard waits are bad, but I can't yet check whether the map is ready
    cy.mapIsReady()
    cy.wait(3000)
  })

  it('creates region from valid input', function() {
    // create a temporary region name
    const regionName = 'Scratch Region ' + Date.now()
    // Enter region name and description
    cy.findByPlaceholderText('Region Name').type(regionName)
    cy.findByPlaceholderText('Description').type(this.scratchRegion.description)
    // Enter exact coordinates
    cy.findByLabelText(/North bound/)
      .clear()
      .type(this.scratchRegion.north)
    cy.findByLabelText(/South bound/)
      .clear()
      .type(this.scratchRegion.south)
    cy.findByLabelText(/East bound/)
      .clear()
      .type(this.scratchRegion.east)
    cy.findByLabelText(/West bound/)
      .clear()
      .type(this.scratchRegion.west)
    // Select PBF file
    cy.fixture(this.scratchRegion.PBFfile, {encoding: 'base64'}).then(
      fileContent => {
        cy.get('input[type="file"]').upload({
          encoding: 'base64',
          fileContent,
          fileName: this.scratchRegion.PBFfile,
          mimeType: 'application/octet-stream'
        })
      }
    )
    // Create the region
    cy.findByRole('button', {name: /Set up a new region/}).click()
    // redirect to bundle upload
    cy.contains('Upload a new GTFS Bundle', {timeout: 10000})
    // Region is listed in main regions menu
    cy.visit('/')
    cy.findByText(regionName).click()
    // region settings are saved correctly
    cy.get('svg[data-icon="map"]').click()
    cy.contains('Edit region')

    cy.findByPlaceholderText('Region Name').should('have.value', regionName)
    cy.findByPlaceholderText('Description').should(
      'have.value',
      this.scratchRegion.description
    )
    // coordinate values are rounded to match analysis grid
    let maxError = 0.02
    cy.findByLabelText(/North bound/)
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.scratchRegion.north)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.findByLabelText(/South bound/)
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.scratchRegion.south)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.findByLabelText(/East bound/)
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.scratchRegion.east)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.findByLabelText(/West bound/)
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.scratchRegion.west)
        expect(roundingError).to.be.lessThan(maxError)
      })
    // Delete region
    cy.visit('/')
    cy.findByText(regionName).click()
    cy.location('pathname').should('match', /regions\/.{24}/)
    cy.wait(200)
    cy.get('svg[data-icon="map"]').click()
    cy.findByText(/Delete this region/).click()
    // should go back to home page
    cy.location('pathname').should('eq', '/')
  })

  it('is able to search for a location by name', function() {
    cy.mapIsReady()
    cy.get('input#react-select-2-input')
      .focus()
      .clear()
      .type(this.scratchRegion.searchTerm)
    cy.contains(this.scratchRegion.foundName).click({force: true})
  })

  it('does not allow invalid coordinates', () => {
    cy.findByLabelText(/North bound/).as('North')
    cy.findByLabelText(/South bound/).as('South')
    cy.findByLabelText(/East bound/).as('East')
    cy.findByLabelText(/West bound/).as('West')
    // try to set south == north
    cy.get('@North')
      .invoke('val')
      .then(northVal => {
        cy.get('@South')
          .clear()
          .type(northVal)
          .blur()
        cy.wait(300)
        cy.get('@South')
          .invoke('val')
          .then(southVal => {
            expect(Number(southVal)).to.be.lessThan(Number(northVal))
          })
      })
    // try to set east < west
    cy.get('@East')
      .invoke('val')
      .then(eastVal => {
        cy.get('@West')
          .clear()
          .type(Number(eastVal) + 1)
          .blur()
        cy.wait(300)
        cy.get('@West')
          .invoke('val')
          .then(westVal => {
            expect(Number(westVal)).to.be.lessThan(Number(eastVal))
          })
      })
    // try to enter a non-numeric value
    // form should revert to previous numeric value
    cy.get('@West')
      .clear()
      .type('letters')
      .blur()
    cy.wait(300)
    cy.get('@West')
      .invoke('val')
      .then(westVal => {
        assert.isNotNaN(Number(westVal))
      })
  })
})
