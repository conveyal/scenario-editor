const runTime = new Date()
const regionName = 'Scratch Region ' + runTime.toUTCString()

describe('Scratch region tests, run locally', () => {
  it('Locate region set-up link on home page', () => {
    //cy.server({
    //  urlMatchingOptions: { matchBase: false, dot: true }
    //})
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    //cy.route('https://api.mapbox.com/.*').as('tileserver')
    //cy.wait('@tileserver')
  })

  it('Enter region name and description', () => {
    cy.findByPlaceholderText('Region Name').type(regionName)
    cy.fixture('regions/scratch.json').then(region => {
      cy.findByPlaceholderText('Description').type(region.description)
    })
  })

  it('Search for location by name', () => {
    cy.mapIsReady()
    cy.fixture('regions/scratch.json').then(region => {
      cy.get('input#react-select-2-input')
        .focus()
        .clear()
        .type(region.searchTerm)
      cy.contains(region.foundName).click({force: true})
    })
  })

  it('Coordinate input validation works', () => {
    let coordinates = [
      // invalid because n < s & e < w
      //{valid: false, n: '1', s: '2', e: '3', w: '4'},
      // Rome, Italy
      //{valid: true, n: '42.02', s: '41.74', e: '12.70', w: '12.31'}
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

  it('Enter exact coordinates', () => {
    cy.fixture('regions/scratch.json').then(region => {
      cy.findByLabelText(/North bound/)
        .clear()
        .type(region.north)
      cy.findByLabelText(/South bound/)
        .clear()
        .type(region.south)
      cy.findByLabelText(/East bound/)
        .clear()
        .type(region.east)
      cy.findByLabelText(/West bound/)
        .clear()
        .type(region.west)
    })
  })

  it('Select PBF file', () => {
    cy.fixture('regions/scratch.json').then(region => {
      cy.fixture(region.PBFfile, {encoding: 'base64'}).then(fileContent => {
        cy.get('input[type="file"]').upload({
          encoding: 'base64',
          fileContent,
          fileName: region.PBFfile,
          mimeType: 'application/octet-stream'
        })
      })
    })
  })

  it('Create region', () => {
    cy.findByRole('button', {name: /Set up a new region/}).click()
    cy.contains('Upload a new GTFS Bundle', {timeout: 10000})
  })

  it('Region settings saved correctly', () => {
    cy.visit('/')
    // region is listed with correct name
    cy.findByText(regionName).click()
    cy.get('svg[data-icon="map"]').click()
    cy.contains('Edit region')
    cy.fixture('regions/scratch.json').then(region => {
      cy.findByPlaceholderText('Region Name').should('have.value', regionName)
      cy.findByPlaceholderText('Description').should(
        'have.value',
        region.description
      )
      // coordinate values are rounded to match analysis grid
      let maxError = 0.01
      cy.findByLabelText(/North bound/)
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.north)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.findByLabelText(/South bound/)
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.south)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.findByLabelText(/East bound/)
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.east)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.findByLabelText(/West bound/)
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.west)
          expect(roundingError).to.be.lessThan(maxError)
        })
    })
  })

  it('Delete region', () => {
    cy.visit('/')
    cy.findByText(regionName).click()
    cy.get('svg[data-icon="map"]').click()
    cy.findByText(/Delete this region/).click()
  })
})
