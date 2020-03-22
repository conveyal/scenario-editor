const regionName = 'Scratch Region ' + Date.now()

describe('Scratch region tests, run locally', () => {
  it('Locate region set-up link on home page', () => {
    //    cy.server()
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    //    cy.route({method:'GET',url:'https://api.mapbox.com*'}).as('tileserver')
    //    cy.wait('@tileserver')
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
      cy.get('#north-bound')
        .clear()
        .type(v.n)
      cy.get('#south-bound')
        .clear()
        .type(v.s)
      cy.get('#east-bound')
        .clear()
        .type(v.e)
      cy.get('#west-bound')
        .clear()
        .type(v.w)
    })
  })

  it('Enter exact coordinates', () => {
    cy.fixture('regions/scratch.json').then(region => {
      cy.get('#north-bound')
        .clear()
        .type(region.north)
      cy.get('#south-bound')
        .clear()
        .type(region.south)
      cy.get('#east-bound')
        .clear()
        .type(region.east)
      cy.get('#west-bound')
        .clear()
        .type(region.west)
    })
    //    cy.get('button[name="Set up a new region"]').should('have.attr', 'disabled')
  })

  it('Select PBF file', () => {
    cy.fixture('regions/scratch.json').then(region => {
      cy.fixture(region.PBFfile, {encoding: 'base64'}).then(fileContent => {
        cy.get('input[type=file]').upload({
          encoding: 'base64',
          fileContent,
          fileName: region.PBFfile,
          mimeType: 'application/octet-stream'
        })
      })
    })
  })

  it('Create region', () => {
    cy.get('button[name="Set up a new region"]').click()
    cy.contains('Upload a new GTFS Bundle', {timeout: 10000})
  })

  it('Region settings saved correctly', () => {
    cy.visit('/')
    // region is listed with correct name
    cy.findByText(regionName).click()
    cy.get('svg[data-icon="map"]').click()
    cy.contains('Edit region')
    cy.fixture('regions/scratch.json').then(region => {
      cy.get('input[placeholder="Region Name"]').should(
        'have.value',
        regionName
      )
      cy.get('input[placeholder="Description"]').should(
        'have.value',
        region.description
      )
      // coordinate values are rounded to match analysis grid
      let maxError = 0.01
      cy.get('input#north-bound')
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.north)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.get('input#south-bound')
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.south)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.get('input#east-bound')
        .invoke('val')
        .then(val => {
          let roundingError = Math.abs(Number(val) - region.east)
          expect(roundingError).to.be.lessThan(maxError)
        })
      cy.get('input#west-bound')
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
    cy.contains('Delete this region').click()
  })
})
