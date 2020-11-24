import {getDefaultRegion, scratchRegion, scratchResults} from './utils'

/* eslint-disable cypress/no-unnecessary-waiting */

const getFromTime = () => cy.findByLabelText(/From time/i)
const getToTime = () => cy.findAllByLabelText(/To time/i)
const getOpportunityCount = () =>
  cy.findByLabelText(/Opportunities within isochrone/).itsNumericText()

describe('Analysis', () => {
  const region = getDefaultRegion()

  beforeEach(() => {
    cy.visitHome()
    region.setupAnalysis({scenario: 'baseline'})
  })

  it('has all form elements', function () {
    // note that elements touched in beforeEach are neglected here
    cy.findByRole('slider', {name: 'Time cutoff'})
    cy.findByRole('slider', {name: /Travel time percentile/i})
    cy.getPrimaryAnalysisSettings()
      .findByRole('button', {
        name: 'Fetch results with the current settings to enable button'
      })
      .should('be.disabled')
    cy.getPrimaryAnalysisSettings().contains(region.defaultProject.name)
    cy.getPrimaryAnalysisSettings().contains('Default')

    cy.getPrimaryAnalysisSettings().findByRole('button', {name: /Walk access/i})
    cy.getPrimaryAnalysisSettings().findByRole('button', {name: /Bus/i})
    cy.getPrimaryAnalysisSettings().findByRole('button', {name: /Walk egress/i})

    cy.findByLabelText(/Walk speed/i)
    cy.findByLabelText(/Max walk time/i)
    cy.getPrimaryAnalysisSettings().findByLabelText(/Date/i)
    getFromTime()
    getToTime()
    cy.getPrimaryAnalysisSettings().findByLabelText(/Simulated Schedules/i)
    cy.getPrimaryAnalysisSettings().findByLabelText(/Maximum transfers/i)
    cy.getPrimaryAnalysisSettings().findByLabelText(/Decay function/i)
    cy.findByLabelText(/Routing engine/i)
    cy.getPrimaryAnalysisSettings().findAllByLabelText(/Bounds of analysis/i)
    cy.getPrimaryAnalysisSettings().findByRole('tab', {
      name: /Custom JSON editor/i
    })
    cy.findByText(/Fetch results/i).should('be.enabled')
  })

  // tests basic single point analysis at specified locations
  it('runs, giving reasonable results', function () {
    region.defaultOpportunityDataset.select()
    // move marker and align map for snapshot
    for (const key in scratchRegion.locations) {
      const location: L.LatLngTuple = scratchRegion.locations[key]
      cy.setOrigin(location)
      cy.fetchResults()
      getOpportunityCount().isWithin(scratchResults.locations[key].default, 10)
    }
  })

  it('handles direct access by walk/bike only', function () {
    const location = scratchRegion.locations.middle as L.LatLngTuple
    const results = scratchResults.locations.middle
    cy.setOrigin(location)
    cy.centerMapOn(location)
    // turn off all transit
    cy.getPrimaryAnalysisSettings()
      .findByRole('button', {name: /All transit/i})
      .click()
    // it has changed names, becoming:
    cy.getPrimaryAnalysisSettings()
      .findByRole('button', {name: /bike direct mode/i})
      .click()
    cy.getPrimaryAnalysisSettings()
      .findAllByRole('button', {name: /bike egress/i})
      .should('be.disabled')

    region.defaultOpportunityDataset.select()
    cy.fetchResults()

    getOpportunityCount().isWithin(results.bikeOnly)

    cy.get('svg#results-chart')
      .scrollIntoView()
      .matchImageSnapshot('direct-bike-access-chart')
  })

  it('uses custom analysis bounds', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    const results = scratchResults.locations.center

    cy.editPrimaryAnalysisJSON('bounds', scratchRegion.customRegionSubset)
    cy.setOrigin(location)
    cy.fetchResults()

    region.defaultOpportunityDataset.select()
    getOpportunityCount().isWithin(results.customBounds)
  })

  it('gives different results at different times', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    const results = scratchResults.locations.center

    // set time window in morning rush -- should have high access
    getFromTime().clear().type('06:00')
    getToTime().clear().type('08:00')

    cy.setOrigin(location)
    region.defaultOpportunityDataset.select()
    cy.fetchResults()

    getOpportunityCount().isWithin(results['6:00-8:00'], 10)

    // set time window in late evening - lower access
    getFromTime().clear().type('20:00')
    getToTime().clear().type('22:00')
    cy.fetchResults()
    getOpportunityCount().isWithin(results['20:00-22:00'], 10)

    // narrow window to one minute - no variability
    getFromTime().clear().type('12:00')
    getToTime().clear().type('12:01')
    cy.fetchResults()

    cy.get('svg#results-chart')
      .scrollIntoView()
      .matchImageSnapshot('chart-no-variation')
  })

  it('charts accessibility', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    cy.setOrigin(location)

    region.defaultOpportunityDataset.select()
    cy.fetchResults()

    cy.get('svg#results-chart')
      .as('chart')
      .scrollIntoView()
      .matchImageSnapshot('single-scenario-chart')
    // add a comparison case to the chart
    cy.getComparisonAnalysisSettings()
      .findByLabelText(/^Project$/)
      .click({force: true})
      .type('scratch{enter}')
    cy.getComparisonAnalysisSettings()
      .findByLabelText(/^Scenario$/)
      .click({force: true})
      .type('baseline{enter}')
    // change the mode
    cy.getComparisonAnalysisSettings()
      .findByLabelText(/Identical request settings/i)
      .uncheck({force: true})
    cy.getComparisonAnalysisSettings()
      .findByRole('button', {name: /bike access mode/i})
      .click()
    cy.fetchResults()
    cy.get('@chart')
      .scrollIntoView()
      .matchImageSnapshot('chart-with-comparison')
  })

  it('handles decay functions', function () {
    // Should be disabled for < v6
    cy.getPrimaryAnalysisSettings()
      .findByLabelText(/Routing engine/)
      .click({force: true})
      .type('v5.10.0{enter}')

    cy.getPrimaryAnalysisSettings()
      .findByLabelText(/Decay Function/i)
      .should('be.disabled')

    cy.fetchResults()
    cy.findByText(/Select an opportunity dataset to see accessibility/)

    // Should be enabled for >= v6
    cy.getPrimaryAnalysisSettings()
      .findByLabelText(/Routing engine/)
      .click({force: true})
      .type('v6.0.0{enter}')

    cy.getPrimaryAnalysisSettings()
      .findByLabelText(/Decay Function/i)
      .should('be.enabled')
      .select('logistic')

    cy.fetchResults()
    cy.findByText(/Select an opportunity dataset to see accessibility/)
    region.defaultOpportunityDataset.select()

    // Logistic function should cause "out of sync" after dataset selected
    cy.findByText(/Results are out of sync with settings/)
    cy.fetchResults()
    cy.findByText(/Analyze results/)
  })

  describe('presets', () => {
    it('CRUD a preset', function () {
      const name = Cypress.env('dataPrefix') + 'preset'
      // Preset select does not exist without first creating a preset
      cy.getPrimaryAnalysisSettings()
        .findByRole('button', {name: /Save/})
        .click()
      cy.findByLabelText(/Name/).type(name)
      cy.findByRole('button', {name: /Create preset/}).click()
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Created new preset/)

      // Preset selector should now exist
      cy.getPrimaryAnalysisSettings()
        .findByLabelText(/Active preset/)
        .click({force: true})
        .type(`${name}{enter}`)

      // Edit the preset name
      cy.getPrimaryAnalysisSettings()
        .findByRole('button', {name: /Edit preset name/})
        .click()
      cy.findByRole('dialog').should('exist')
      cy.findByLabelText(/Name/).dblclick().type('edited name')
      cy.findByRole('button', {name: /Save/}).click()
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Saved changes to preset/)

      // Delete the preset
      cy.getPrimaryAnalysisSettings()
        .findByRole('button', {name: /Delete selected preset/})
        .click()
      cy.findByRole('button', {name: /Confirm: Delete preset/}).click()
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Deleted selected preset/)
    })
  })
})
