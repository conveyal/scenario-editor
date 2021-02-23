import {getDefaultRegion, scratchRegion} from './utils'

function generateName(type, name) {
  return `${Cypress.env('dataPrefix')}${type}_${name}_${Date.now()}`
}

function deleteEntireDataset() {
  cy.findButton(/Delete entire dataset source/i).click()
  cy.findButton(/Confirm: Delete entire dataset source/i).click()
}

// How long should it take to create an OD
const timeout = 240000

describe('Opportunity Datasets', function () {
  const region = getDefaultRegion()

  beforeEach(() => region.navTo('spatial datasets'))

  const importedWithGrid = region.getSpatialDataset(
    'Grid Import',
    scratchRegion.opportunities.grid.file
  )

  it('create, read, edit, delete', () => {
    const name = generateName('OD', 'test')
    const newName = generateName('OD', 'newName')
    cy.createOpportunityDataset(name, scratchRegion.opportunities.grid.file)
    cy.get('#totalOpportunities').itsNumericText().should('eq', 227903)
    cy.findByRole('group', {name: /Spatial dataset name/}).click()
    cy.focused().type(newName).blur()
    cy.navTo('projects')
    cy.navTo('spatial datasets')
    cy.findByLabelText(/or select an existing layer/)
      .click({force: true})
      .type(`${newName}{enter}`)
    cy.findButton(/Delete this layer/).click()
    cy.findButton(/Confirm: Delete this layer/).click()
  })

  describe('can be imported', () => {
    it('from CSV', () => {
      const opportunity = scratchRegion.opportunities.csv
      const oppName = generateName('opportunities', opportunity.name)
      const expectedFieldCount = 1 + opportunity.numericFields.length
      cy.findByText(/Upload a new dataset/i).click()
      cy.navComplete()

      cy.findByLabelText(/Spatial dataset name/i).type(oppName)
      cy.findByLabelText(/^Select spatial dataset/i).attachFile(
        opportunity.file
      )
      cy.findByLabelText(/^Latitude/)
        .clear()
        .type(opportunity.latitudeField)
      cy.findByLabelText(/^Longitude/)
        .clear()
        .type(opportunity.longitudeField)
      cy.findButton(/Upload/).click()
      cy.navComplete()
      cy.location('pathname').should('match', /opportunities$/)
      // find the message showing this upload is complete
      cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout})
        .parent()
        .parent()
        .as('notice')
      // check number of fields uploaded
      cy.get('@notice').contains(
        `Finished uploading ${expectedFieldCount} layers`
      )
      // close the message
      cy.get('@notice').findByRole('button', {name: /Close/}).click()
      // select in the dropdown
      cy.findByLabelText(/or select an existing layer/).type(
        `${oppName}: ${opportunity.numericFields[0]} {enter}`,
        {
          force: true
        }
      )
      deleteEntireDataset()
    })

    it('from shapefile', () => {
      const opportunity = scratchRegion.opportunities.shapefile
      const oppName = Cypress.env('dataPrefix') + opportunity.name + '_temp'
      const expectedFieldCount = opportunity.numericFields.length
      cy.findButton(/Upload a new dataset/i).click()
      cy.navComplete()

      cy.findByLabelText(/Spatial dataset name/i).type(oppName)
      cy.findByLabelText(/Select spatial dataset/)
        .attachFile({filePath: opportunity.files[0], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[1], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[2], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[3], encoding: 'base64'})
      cy.findButton(/Upload/).click()
      cy.navComplete()
      cy.location('pathname').should('match', /opportunities$/)
      // find the message showing this upload is complete
      cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout})
        .parent()
        .parent()
        .as('notice')
      // check number of fields uploaded
      cy.get('@notice').contains(
        `Finished uploading ${expectedFieldCount} layers`
      )
      // close the message
      cy.get('@notice').findByRole('button', {name: /Close/}).click()
      // select in the dropdown
      cy.findByLabelText(/or select an existing layer/).type(
        `${oppName}: ${opportunity.numericFields[0]} {enter}`,
        {
          force: true
        }
      )
      deleteEntireDataset()
    })

    it('from .grid', () => {
      importedWithGrid.navTo()
    })

    // doesn't work in offline mode
    it('from LODES importer')
  })

  it('can import CSV as Freeform', () => {
    const opportunity = scratchRegion.opportunities.csv
    const oppName = generateName('opportunities', opportunity.name)
    const expectedFieldCount = 1 + opportunity.numericFields.length
    cy.findByText(/Upload a new dataset/i).click()
    cy.navComplete()

    cy.findByLabelText(/Spatial dataset name/i).type(oppName)
    cy.findByLabelText(/^Select spatial dataset/i).attachFile(opportunity.file)
    cy.findByLabelText(/^Latitude/)
      .clear()
      .type(opportunity.latitudeField)
    cy.findByLabelText(/^Longitude/)
      .clear()
      .type(opportunity.longitudeField)

    cy.findByLabelText(/Enable free form/).check({force: true})
    cy.findByLabelText(/ID field/).type('sport')
    cy.findByLabelText(/Opportunity count field/).type('count')

    cy.findButton(/Upload/).click()
    cy.navComplete()
    cy.location('pathname').should('match', /opportunities$/)
    // find the message showing this upload is complete
    cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout})
      .parent()
      .parent()
      .as('notice')
    // check number of fields uploaded
    cy.get('@notice').contains(
      `Finished uploading ${expectedFieldCount} layers`
    )
    // close the message
    cy.get('@notice').findByRole('button', {name: /Close/}).click()
    // select in the dropdown
    cy.findByLabelText(/or select an existing layer/).type(
      `${oppName}: ${opportunity.numericFields[0]} (freeform) {enter}`,
      {
        force: true
      }
    )
    cy.get('#format').should('contain', 'FREEFORM')
    deleteEntireDataset()
  })

  describe('can be downloaded', () => {
    it('as .grid', () => {
      importedWithGrid.navTo()
      cy.contains(/\.grid/)
      cy.location('href')
        .should('match', /opportunityDatasetId=\w{24}$/)
        .then((href) => {
          const gridId = href.match(/\w{24}$/)[0]
          cy.request(
            `http://localhost:7070/api/opportunities/${gridId}/grid`
          ).then((response) => {
            cy.request(response.body.url).then((response) => {
              cy.readFile(
                'cypress/fixtures/' + scratchRegion.opportunities.grid.file,
                'utf8'
              ).then((file) => {
                expect(response.body).to.equal(file)
              })
            })
          })
        })
    })

    // This currently crahes Cypress
    it.skip('as TIFF', () => {
      importedWithGrid.navTo()
      cy.findButton(/\.tiff/i)
    })
  })
})
