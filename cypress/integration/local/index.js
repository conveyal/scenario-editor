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

    it('Invalid coordinates not allowed', () => {
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

  context('Upload and manage GTFS bundles', () => {
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

  context('Create a new project', () => {
    it('create project', () => {
      cy.get('svg[data-icon="cubes"]').click()
      cy.findByText(/Create new Project/i).click()
      cy.location('pathname').should('match', /create-project/)
      cy.findByLabelText(/Project name/).type('single-GTFS project')
      // hack to select first GTFS from dropdown
      cy.findByLabelText(/Associated GTFS bundle/i)
        .click()
        .type('{downarrow}{enter}')
      cy.get('a.btn')
        .contains(/Create/)
        .click()
      cy.location('pathname').should('match', /regions\/.{24}\/projects\/.{24}/)
      cy.contains(/Modifications/)
    })
  })

  context('Manage scenarios', () => {
    it('Create a new scenario', () => {
      cy.findByText('Scenarios').click()
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('New scenario!')
        cy.findByRole('link', {name: 'Create a scenario'}).click()
      })
      cy.contains('New scenario!')
    })

    it('Modify scenario name', () => {
      // default scenario name is "Default"
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('Scenario 1')
        cy.findByText(/Default/)
          .findByTitle(/Rename this scenario/)
          .click()
      })
      cy.contains(/Scenario 1/)
    })
  })

  context('Create modifications', () => {
    it('Adjust dwell time', () => {
      cy.findByRole('link', {name: 'Create a modification'}).click()
      cy.findByLabelText(/Modification type/i).select('Adjust Dwell Time')
      cy.findByLabelText(/Modification name/i).type('Dwell adjust mod')
      cy.findByRole('link', {name: 'Create'}).click()
      cy.location('pathname').should(
        'match',
        /regions\/.{24}\/projects\/.{24}\/.{24}/
      )
      cy.contains('Dwell adjust mod')
      cy.findByRole('link', {name: /Add description/}).click()
      cy.findByLabelText('Description').type('the description')
      cy.findByLabelText(/Select feed and routes/i)
        .click()
        .type('{downarrow}{enter}')
    })

    it('Adjust speed', () => {})

    it('Remove trips', () => {})
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
