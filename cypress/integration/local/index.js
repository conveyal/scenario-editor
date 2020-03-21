const regionName = 'Scratch Region ' + Date.now()

describe('Scratch region tests, run locally', () => {
  it('Locate region set-up link on home page', () => {
    cy.visit('/')
    cy.findByText('Set up a new region').click()
  })

  it('Enter region name and description', () => {
    cy.findByPlaceholderText('Region Name').type(regionName)
    cy.findByPlaceholderText('Description').type('Scratch region Cypress test')
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
      {valid: false, n: '39.4', s: '67', e: '11', w: '4'},
      {valid: false, n: '9', s: '7', e: '11.5', w: '0'}
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

  it('Delete Region', () => {
    cy.visit('/')
    cy.findByText(regionName).click()
    cy.get('svg[data-icon="map"]').click()
    cy.contains('Delete this region').click()
  })
})
