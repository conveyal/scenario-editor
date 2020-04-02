const runTime = new Date()
const regionName = 'Scratch Region ' + runTime.toUTCString()

describe('Local Tests', () => {
  beforeEach('load scratch fixture', function() {
    cy.fixture('regions/scratch.json').as('scratchRegion')
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
    it('Create a scenario', () => {
      cy.findByText('Scenarios').click()
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('Temp scenario')
        cy.findByRole('link', {name: 'Create a scenario'}).click()
      })
      cy.contains('Temp scenario')
    })

    it('Delete a scenario', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
        cy.findByText(/Temp scenario/)
          .findByTitle(/Delete this scenario/)
          .click()
      })
      cy.findByText(/Temp scenario/).should('not.exist')
    })

    it('Rename a scenario', () => {
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
