describe('Region setup', () => {
  beforeEach(() => {
    // scratch region settings
    cy.fixture('regions/scratch.json').as('region')
    // be on the region setup page
    cy.visit('/regions/create')
    // alias all inputs
    cy.findByLabelText(/Region Name/).as('name')
    cy.findByLabelText('Description').as('description')
    cy.findByLabelText(/North bound/).as('North')
    cy.findByLabelText(/South bound/).as('South')
    cy.findByLabelText(/East bound/).as('East')
    cy.findByLabelText(/West bound/).as('West')
    cy.findByRole('button', {name: /Set up a new region/}).as('create')
    cy.get('input#react-select-2-input').as('search')
  })

  it('can be found from homepage', function () {
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    cy.location('pathname').should('eq', '/regions/create')
  })

  it('does not allow invalid coordinates', () => {
    // try to set south == north
    cy.get('@North')
      .invoke('val')
      .then((northVal) => {
        cy.get('@South').clear().type(northVal).blur()
        cy.get('@South').should((south) => {
          expect(Number(south[0].value)).to.be.lessThan(Number(northVal))
        })
      })
    // try to set east < west
    cy.get('@East')
      .invoke('val')
      .then((eastVal) => {
        cy.get('@West')
          .clear()
          .type(Number(eastVal) + 1)
          .blur()
        cy.get('@West').should((west) => {
          expect(Number(west[0].value)).to.be.lessThan(Number(eastVal))
        })
      })
    // try to enter a non-numeric value
    // form should revert to previous numeric value
    cy.get('@West').clear().type('letters').blur()
    cy.get('@West').should((west) => {
      assert.isNotNaN(Number(west[0].value))
    })
  })

  it('finds locations searched by name', () => {
    let regions = [
      {
        searchTerm: 'cincinnati',
        findText: /^Cincinnati, Ohio/,
        lat: 39.1,
        lon: -84.5
      },
      {
        searchTerm: 'tulsa',
        findText: /^Tulsa, Oklahoma/,
        lat: 36.1,
        lon: -95.9
      },
      {
        searchTerm: 'greenwich',
        findText: /^Greenwich,.* England/,
        lat: 51.5,
        lon: 0
      }
    ]
    let maxOffset = 10000 // meters
    regions.forEach((r) => {
      cy.get('@search').focus().clear().type(r.searchTerm)
      cy.findByText(r.findText).click()
      cy.distanceFromMapCenter([r.lat, r.lon]).then((offset) => {
        expect(offset).to.be.lessThan(maxOffset)
      })
    })
  })

  it('creates new region from valid input', function () {
    // create a temporary region name
    const regionName = 'Scratch Region ' + Date.now()
    // Enter region name and description
    cy.get('@name').type(regionName)
    cy.get('@description').type(this.region.description)
    // search for region by name
    cy.get('@search').focus().clear().type(this.region.searchTerm)
    cy.findByText(this.region.foundName).click()
    cy.distanceFromMapCenter([39.1, -84.5]).then((offset) => {
      expect(offset).to.be.lessThan(10000)
    })
    // Enter exact coordinates
    cy.get('@North').clear().type(this.region.north)
    cy.get('@South').clear().type(this.region.south)
    cy.get('@East').clear().type(this.region.east)
    cy.get('@West').clear().type(this.region.west)
    // Create the region
    cy.get('@create').click()
    // should redirect to bundle upload
    cy.location('pathname').should('match', /regions\/.{24}$/, {timeout: 10000})
    cy.contains('Upload a new Network Bundle')
    // Region is listed in main regions menu
    cy.navTo('Regions')
    cy.findByText(regionName).click()
    cy.location('pathname').should('match', /regions\/.{24}$/)
    // region settings are saved correctly
    cy.navTo('Region Settings')
    cy.contains('Edit region')
    // redeclaration is necessary to prevent the page from reloading... :-(
    cy.findByLabelText(/Region Name/).as('name')
    cy.findByLabelText(/Description/).as('description')
    cy.findByLabelText(/North bound/).as('North')
    cy.findByLabelText(/South bound/).as('South')
    cy.findByLabelText(/East bound/).as('East')
    cy.findByLabelText(/West bound/).as('West')
    // check setting values
    cy.get('@name').should('have.value', regionName)
    cy.get('@description').should('have.value', this.region.description)
    // coordinate values are rounded to match analysis grid
    let maxError = 0.02
    cy.get('@North')
      .invoke('val')
      .then((val) => {
        let roundingError = Math.abs(Number(val) - this.region.north)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@South')
      .invoke('val')
      .then((val) => {
        let roundingError = Math.abs(Number(val) - this.region.south)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@East')
      .invoke('val')
      .then((val) => {
        let roundingError = Math.abs(Number(val) - this.region.east)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.get('@West')
      .invoke('val')
      .then((val) => {
        let roundingError = Math.abs(Number(val) - this.region.west)
        expect(roundingError).to.be.lessThan(maxError)
      })
    cy.mapContainsRegion('scratch')
    // Delete region
    cy.findByText(/Delete this region/).click()
    cy.findByText(/Confirm: Delete this region/).click()
    // should go back to home page
    cy.location('pathname').should('eq', '/')
    cy.contains('Set up a new region')
    cy.findByText(regionName).should('not.exist')
  })
})
