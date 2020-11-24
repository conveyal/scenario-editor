import {getDefaultRegion, scratchRegion} from './utils'

function generateName(type, name) {
  return `${Cypress.env('dataPrefix')}${type}_${name}_${Date.now()}`
}

// How long should it take to create an OD
const timeout = 240000

describe('Opportunity Datasets', function () {
  const region = getDefaultRegion()

  beforeEach(() => region.navTo('opportunity datasets'))

  const importedWithGrid = region.getOpportunityDataset(
    'Grid Import',
    scratchRegion.opportunities.grid.file
  )

  after(() => importedWithGrid.delete())

  describe('can be imported', () => {
    it('from CSV', () => {
      const opportunity = scratchRegion.opportunities.csv
      const oppName = generateName('opportunities', opportunity.name)
      const expectedFieldCount = 1 + opportunity.numericFields.length
      cy.findByText(/Upload a new dataset/i).click()
      cy.location('pathname').should('match', /\/opportunities\/upload$/)
      cy.findByLabelText(/Opportunity dataset name/i).type(oppName)
      cy.findByLabelText(/^Select opportunity dataset/i).attachFile(
        opportunity.file
      )
      cy.findByLabelText(/Latitude/).type(opportunity.latitudeField)
      cy.findByLabelText(/Longitude/).type(opportunity.longitudeField)
      cy.findByRole('button', {name: /Upload/}).click()
      cy.navComplete()
      cy.location('pathname').should('match', /opportunities$/)
      // find the message showing this upload is complete
      cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout})
        .parent()
        .parent()
        .as('notice')
      // check number of fields uploaded
      cy.get('@notice').contains(
        `Finished uploading ${expectedFieldCount} features`
      )
      // close the message
      cy.get('@notice').findByRole('button', {name: /Close/}).click()
      // select in the dropdown
      cy.findByLabelText(/or select an existing one/).type(
        `${oppName}: ${opportunity.numericFields[0]} {enter}`,
        {
          force: true
        }
      )
      cy.contains(/Delete entire dataset/i).click()
    })

    it('from shapefile', () => {
      const opportunity = scratchRegion.opportunities.shapefile
      const oppName = Cypress.env('dataPrefix') + opportunity.name + '_temp'
      const expectedFieldCount = opportunity.numericFields.length
      cy.findByText(/Upload a new dataset/i).click()
      cy.location('pathname').should('match', /\/opportunities\/upload$/)
      cy.findByLabelText(/Opportunity dataset name/i).type(oppName)
      cy.findByLabelText(/Select opportunity dataset/)
        .attachFile({filePath: opportunity.files[0], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[1], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[2], encoding: 'base64'})
        .attachFile({filePath: opportunity.files[3], encoding: 'base64'})
      cy.findByRole('button', {name: /Upload/}).click()
      cy.navComplete()
      cy.location('pathname').should('match', /opportunities$/)
      // find the message showing this upload is complete
      cy.contains(new RegExp(oppName + ' \\(DONE\\)'), {timeout})
        .parent()
        .parent()
        .as('notice')
      // check number of fields uploaded
      cy.get('@notice').contains(
        `Finished uploading ${expectedFieldCount} features`
      )
      // close the message
      cy.get('@notice').findByRole('button', {name: /Close/}).click()
      // select in the dropdown
      cy.findByLabelText(/or select an existing one/).type(
        `${oppName}: ${opportunity.numericFields[0]} {enter}`,
        {
          force: true
        }
      )
      cy.contains(/Delete entire dataset/i).click()
    })

    it('from .grid', () => {
      importedWithGrid.navTo()
    })

    // doesn't work in offline mode
    it('from LODES importer')
  })

  describe('can be downloaded', () => {
    it('as .grid', () => {
      importedWithGrid.navTo()
      cy.contains(/Download as \.grid/)
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

    it('as TIFF') // produces an error
  })
})
