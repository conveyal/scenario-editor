import {getDefaultRegion, scratchRegion} from './utils'

// Bundles may take awhile to upload
const processingTimeout = 240000

// Bundle Names
const names = {
  corrupt: Cypress.env('dataPrefix') + 'Corrupt Bundle',
  multiple: Cypress.env('dataPrefix') + 'Multiple GTFS',
  reuse: Cypress.env('dataPrefix') + 'Reuse OSM and GTFS'
}

function createBundle(name: string, selectFilesFn: () => void) {
  cy.findByText(/Create a new network bundle/).click()
  cy.findByLabelText(/Bundle Name/i).type(name)

  selectFilesFn()

  cy.findButton(/Create/)
    .should('not.be.disabled')
    .click()

  // Popover should show up
  cy.findByText('Processing bundle ' + name)

  // Completed text should appear
  cy.findByText(/Completed\./, {timeout: processingTimeout})

  // Click "View work product" button (which also clears the task)
  cy.findButton(/View work product/).click()

  cy.location('pathname').should('match', /\/bundles\/.{24}$/)
}

function deleteThisBundle(bundleName: string) {
  cy.findByRole('button', {name: /Delete this network bundle/i}).click()
  cy.findButton(/Confirm/).click()
  cy.location('pathname').should('match', /.*\/bundles$/)
  cy.navComplete()
  cy.findByText(/Select.../).click()
  cy.contains(bundleName).should('not.exist')
}

describe('Network bundles', () => {
  const region = getDefaultRegion()

  const singleFeedBundle = region.getBundle(
    'Temporary Single feed',
    scratchRegion.GTFSfile,
    scratchRegion.PBFfile
  )

  beforeEach(() => region.navTo('network bundles'))

  after(() => singleFeedBundle.delete())

  it('with single feed can be uploaded and deleted', function () {
    singleFeedBundle.navTo()

    // confirm that the bundle was saved
    cy.contains('or select an existing one')
    cy.location('pathname').should('match', /.*bundles\/.{24}$/)
    cy.findByLabelText(/Network bundle name/i)
      .invoke('val')
      .should('equal', singleFeedBundle.name)
    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .should('equal', scratchRegion.feedAgencyName)
    cy.findByLabelText(/Feed #2/).should('not.exist')
  })

  it('can reuse OSM and GTFS components', function () {
    createBundle(names.reuse, () => {
      cy.findByText(/Reuse existing OpenStreetMap/i).click()
      cy.findByText(/network bundle to reuse OSM from/i)
        .parent()
        .select(singleFeedBundle.name)
      cy.findByText(/Reuse existing GTFS/i).click()
      cy.findByText(/network bundle to reuse GTFS from/i)
        .parent()
        .select(singleFeedBundle.name)
    })

    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .should('equal', scratchRegion.feedAgencyName)

    deleteThisBundle(names.reuse)
  })

  it('rejects obviously corrupt GTFS', function () {
    cy.findByText(/Create a new network bundle/).click()
    cy.findByLabelText(/Bundle Name/i).type(names.corrupt)
    cy.findByText(/Reuse existing OpenStreetMap/i).click()
    cy.findByText(/network bundle to reuse OSM from/i)
      .parent()
      .select(singleFeedBundle.name)
    cy.findByText(/Upload new GTFS/i).click()
    cy.findByLabelText(/Select .*GTFS/i).attachFile({
      filePath: scratchRegion.corruptGTFSfile,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findButton(/Create/i).click()
    cy.findByText(/NoSuchElementException: No value present/, {
      timeout: processingTimeout
    })
    cy.findButton(/View error details/).click()
    region.navTo('network bundles')
    // TODO need semantic selector for dropdown
    cy.findByText('Select...').click().type('Corrupt{enter}')
    cy.contains(names.corrupt)
    cy.findByRole('alert').contains(
      'Please upload valid OSM .pbf and GTFS .zip files.'
    )

    deleteThisBundle(names.corrupt)
  })

  it('with multiple GTFS feeds can be uploaded', function () {
    createBundle(names.multiple, () => {
      cy.findByText(/Reuse existing OpenStreetMap/i).click()
      cy.findByText(/network bundle to reuse OSM from/i)
        .parent()
        .select(singleFeedBundle.name)
      cy.findByText(/Upload new GTFS/i).click()
      cy.findByLabelText(/Select .*GTFS/i).attachFile([
        {
          filePath: scratchRegion.GTFSfile,
          encoding: 'base64',
          mimeType: 'application/octet-stream'
        },
        {
          filePath: scratchRegion.GTFSfile,
          encoding: 'base64',
          mimeType: 'application/octet-stream'
        }
      ])
    })

    cy.findByLabelText(/Feed #1/)
      .invoke('val')
      .should('equal', scratchRegion.feedAgencyName)
    cy.findByLabelText(/Feed #2/)
      .invoke('val')
      .should('equal', scratchRegion.feedAgencyName)
    cy.findByLabelText(/Feed #3/).should('not.exist')

    deleteThisBundle(names.multiple)
  })
})
