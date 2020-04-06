describe('Region setup', () => {
  beforeEach(() => {
    // scratch region settings
    cy.fixture('regions/scratch.json').as('region')
    // be on the region setup page
    cy.visit('/regions/create')
    // alias all inputs
    cy.findByPlaceholderText('Region Name').as('name')
    cy.findByPlaceholderText('Description').as('description')
    cy.findByLabelText(/North bound/).as('North')
    cy.findByLabelText(/South bound/).as('South')
    cy.findByLabelText(/East bound/).as('East')
    cy.findByLabelText(/West bound/).as('West')
    cy.findByRole('button', {name: /Set up a new region/}).as('create')
    cy.get('input#react-select-2-input').as('search')
    cy.get('input[type="file"]').as('PBFupload')
  })

  it('can be found from homepage', function() {
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    cy.location('pathname').should('eq', '/regions/create')
  })

  it('does not allow invalid coordinates', () => {
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

  it('finds locations searched by name', function() {
    cy.get('@search')
      .focus()
      .clear()
      .type('cincinnati')
    cy.contains(/Cincinnati, Ohio/, {timeout: 10000}).click({force: true})
    // assert about map location
    cy.get('@search')
      .focus()
      .clear()
      .type('alabama')
    cy.contains(/Alabama, United States/).click({force: true})
    // assert about map state
  })

  it('creates new region from valid input', function() {
    // create a temporary region name
    const regionName = 'Scratch Region ' + Date.now()
    // Enter region name and description
    cy.get('@name').type(regionName)
    cy.get('@description').type(this.region.description)
    // search for region by name
    cy.get('@search')
      .focus()
      .clear()
      .type(this.region.searchTerm)
    cy.contains(this.region.foundName).click({force: true})
    // Enter exact coordinates
    cy.get('@North')
      .clear()
      .type(this.region.north)
    cy.get('@South')
      .clear()
      .type(this.region.south)
    cy.get('@East')
      .clear()
      .type(this.region.east)
    cy.get('@West')
      .clear()
      .type(this.region.west)
    // Select PBF file
    cy.fixture(this.region.PBFfile, {encoding: 'base64'}).then(fileContent => {
      cy.get('@PBFupload').upload({
        encoding: 'base64',
        fileContent,
        fileName: this.region.PBFfile,
        mimeType: 'application/octet-stream'
      })
    })
    // Create the region
    cy.get('@create').click()
    // should redirect to bundle upload
    cy.location('pathname').should('match', /regions\/.{24}$/, {timeout: 10000})
    cy.contains('Upload a new GTFS Bundle')
    // Region is listed in main regions menu
    cy.findByTitle('Regions').click({force: true})
    cy.location('pathname').should('eq', '/')
    cy.findByText(regionName).click()
    cy.location('pathname').should('match', /regions\/.{24}$/)
    // region settings are saved correctly
    cy.findByTitle('Region Settings').click({force: true})
    cy.location('pathname').should('match', /regions\/.{24}\/edit$/)
    cy.contains('Edit region')
    // settings are saved correctly
    // redeclaration is necessary to prevent the page from reloading... :-(
    cy.findByPlaceholderText('Region Name').as('name')
    cy.findByPlaceholderText('Description').as('description')
    cy.findByLabelText(/North bound/).as('North')
    cy.findByLabelText(/South bound/).as('South')
    cy.findByLabelText(/East bound/).as('East')
    cy.findByLabelText(/West bound/).as('West')

    cy.get('@name').should('have.value', regionName)
    cy.get('@description').should('have.value', this.region.description)

    // coordinate values are rounded to match analysis grid
    let maxError = 0.02
    cy.get('@North')
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.region.north)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@South')
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.region.south)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@East')
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.region.east)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@West')
      .invoke('val')
      .then(val => {
        let roundingError = Math.abs(Number(val) - this.region.west)
        expect(roundingError).to.be.lessThan(maxError)
      })
    // Delete region
    cy.findByText(/Delete this region/).click()
    // should go back to home page
    cy.location('pathname').should('eq', '/')
  })
})
