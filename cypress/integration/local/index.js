const runTime = new Date()
const regionName = 'Scratch Region ' + runTime.toUTCString()

describe('Local Tests', () => {
  beforeEach('load scratch fixture', function() {
    cy.fixture('regions/scratch.json').as('scratchRegion')
  })

  context('Set up a new scratch region', () => {
    it('Locate region set-up link on home page', () => {
      cy.visit('/')
      cy.findByText('Set up a new region').click()
      cy.location('pathname').should('eq', '/regions/create')
      // TODO hard waits are bad, but I can't yet check whether the map is ready
      cy.mapIsReady()
      cy.wait(3000)
    })

    it('Enter region name and description', function() {
      cy.findByPlaceholderText('Region Name').type(regionName)
      cy.findByPlaceholderText('Description').type(
        this.scratchRegion.description
      )
    })

    it('Search for location by name', function() {
      cy.mapIsReady()
      cy.get('input#react-select-2-input')
        .focus()
        .clear()
        .type(this.scratchRegion.searchTerm)
      cy.contains(this.scratchRegion.foundName).click({force: true})
    })

    it('Enter exact coordinates', function() {
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
    })

    it('Select PBF file', function() {
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
    })

    it('Create region', () => {
      cy.findByRole('button', {name: /Set up a new region/}).click()
      cy.contains('Upload a new GTFS Bundle', {timeout: 10000})
    })
  })

  context('Verify and modify region settings', () => {
    it('Region settings saved correctly', function() {
      cy.visit('/')
      // region is listed with correct name
      cy.findByText(regionName).click()
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
    })

    /*
    it('Coordinate input validation works', () => {
      let coordinates = [
        // invalid because n < s & e < w
        {valid: false, n: '1', s: '2', e: '3', w: '4'},
        // Rome, Italy
        {valid: true, n: '42.02', s: '41.74', e: '12.70', w: '12.31'}
      ]
      coordinates.forEach(v => {
        cy.findByLabelText(/North bound/)
          .clear()
          .type(v.n)
        cy.findByLabelText(/South bound/)
          .clear()
          .type(v.s)
        cy.findByLabelText(/East bound/)
          .clear()
          .type(v.e)
        cy.findByLabelText(/West bound/)
          .clear()
          .type(v.w)
      })
    })
    */
  })

  context('Uplaod and manage GTFS bundles', () => {
    it('Upload single GTFS bundle', function() {
      cy.get('svg[data-icon="database"]').click()
      cy.findByText(/Create a bundle/).click()
      cy.location('pathname').should('match', /.*\/bundles\/create$/)
      cy.findByLabelText(/Bundle Name/i).type('single GTFS bundle')
      cy.fixture(this.scratchRegion.GTFSfile, {encoding: 'base64'}).then(
        fileContent => {
          cy.get('input[type="file"]').upload({
            encoding: 'base64',
            fileContent,
            fileName: this.scratchRegion.GTFSfile,
            mimeType: 'application/octet-stream'
          })
        }
      )
      cy.findByRole('button', {name: /Create/i}).click()
      cy.findByText(/Processing/)
      cy.location('pathname', {timeout: 30000}).should('match', /\/bundles$/)
      // TODO verify the upload is selectable from the dropdown
    })
  })

  context('Delete scratch region', () => {
    it('Delete region', () => {
      cy.visit('/')
      cy.findByText(regionName).click()
      cy.get('svg[data-icon="map"]').click()
      cy.findByText(/Delete this region/).click()
    })
  })
})
