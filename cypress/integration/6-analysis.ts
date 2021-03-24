import {
  defaultAnalysisSettings,
  getDefaultRegion,
  scratchRegion,
  scratchResults
} from './utils'

/* eslint-disable cypress/no-unnecessary-waiting */

const getFromTime = () => cy.findByLabelText(/From time/i)
const getToTime = () => cy.findByLabelText(/To time/i)
const getOpportunityCount = () =>
  cy.findByLabelText(/Opportunities within isochrone/).itsNumericText()

describe('Analysis', () => {
  const region = getDefaultRegion()

  beforeEach(() => {
    cy.visitHome()
    region.setupAnalysis(
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          bounds: region.bounds,
          date: region.defaultBundle.date
        }
      },
      {
        project: region.defaultProject,
        scenario: 'baseline',
        settings: {
          ...defaultAnalysisSettings,
          bounds: region.bounds,
          date: region.defaultBundle.date
        }
      }
    )
  })

  it('has all form elements', function () {
    // note that elements touched in beforeEach are neglected here
    cy.findByLabelText(/Travel time cutoff minutes/)
    cy.findByRole('slider', {name: /Travel time percentile/i})
    cy.getPrimaryAnalysisSettings().within(() => {
      cy.findButton(
        'Fetch results with the current settings to enable button'
      ).should('be.disabled')
      cy.contains(region.defaultProject.name)
      cy.contains('Default')

      cy.findButton(/Walk access/i)
      cy.findButton(/Bus/i)
      cy.findButton(/Walk egress/i)

      cy.findByLabelText(/Walk speed/i)
      cy.findByLabelText(/Max walk time/i)
      cy.findByLabelText(/Date/i)
      getFromTime()
      getToTime()
      cy.findByLabelText(/Simulated Schedules/i)
      cy.findByLabelText(/Maximum transfers/i)
      cy.findByLabelText(/Decay function/i)
      cy.findByLabelText(/Routing engine/i)
      cy.findAllByLabelText(/Bounds of analysis/i)
      cy.findByRole('tab', {
        name: /Custom JSON editor/i
      })
    })
    cy.findButton(/^Fetch results$/i).should('be.enabled')
  })

  // tests basic single point analysis at specified locations
  it('runs, giving reasonable results', function () {
    region.defaultSpatialDataset.select()
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
    cy.getPrimaryAnalysisSettings().within(() => {
      // turn off all transit
      cy.findButton(/All transit/i).click()
      // it has changed names, becoming:
      cy.findButton(/bike direct mode/i).click()
      cy.findButton(/bike egress/i).should('be.disabled')
      cy.findByLabelText(/Max LTS/).select('4')
    })

    region.defaultSpatialDataset.select()
    cy.fetchResults()

    getOpportunityCount().isWithin(results.bikeOnly)

    cy.get('svg#results-chart')
      .scrollIntoView()
      .matchImageSnapshot('direct-bike-access-chart')
  })

  it('has lower access with lower bike LTS', () => {
    const location = scratchRegion.locations.middle as L.LatLngTuple

    cy.getPrimaryAnalysisSettings().within(() => {
      cy.findButton(/Bike Access mode/i).click()
      cy.findByLabelText(/Max LTS/).select('4')
    })

    cy.getComparisonAnalysisSettings().within(() => {
      cy.findButton(/Bike Access mode/).click()
    })

    region
      .fetchAccessibilityComparison(location)
      .then(([highStress, lowStress]) =>
        expect(lowStress).to.be.lessThan(highStress)
      )
  })

  it('uses custom analysis bounds', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    const results = scratchResults.locations.center

    cy.editPrimaryAnalysisJSON('bounds', scratchRegion.customRegionSubset)
    cy.setOrigin(location)
    cy.fetchResults()

    region.defaultSpatialDataset.select()
    getOpportunityCount().isWithin(results.customBounds)
  })

  it('gives different results at different times', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    const results = scratchResults.locations.center

    // set time window in morning rush -- should have high access
    cy.getPrimaryAnalysisSettings().within(() => {
      getFromTime().clear().type('06:00')
      getToTime().clear().type('08:00')
    })

    cy.setOrigin(location)
    region.defaultSpatialDataset.select()
    cy.fetchResults()

    getOpportunityCount().isWithin(results['6:00-8:00'], 10)

    // set time window in late evening - lower access
    cy.getPrimaryAnalysisSettings().within(() => {
      getFromTime().clear().type('20:00')
      getToTime().clear().type('22:00')
    })
    cy.fetchResults()
    getOpportunityCount().isWithin(results['20:00-22:00'], 10)

    // narrow window to one minute - no variability
    cy.getPrimaryAnalysisSettings().within(() => {
      getFromTime().clear().type('12:00')
      getToTime().clear().type('12:01')
    })
    cy.fetchResults()

    cy.get('svg#results-chart')
      .scrollIntoView()
      .matchImageSnapshot('chart-no-variation')
  })

  it('charts accessibility', function () {
    const location = scratchRegion.locations.center as L.LatLngTuple
    cy.setOrigin(location)

    region.defaultSpatialDataset.select()
    cy.fetchResults()

    cy.get('svg#results-chart')
      .as('chart')
      .scrollIntoView()
      .matchImageSnapshot('single-scenario-chart')
    // add a comparison case to the chart
    cy.getComparisonAnalysisSettings().within(() => {
      cy.findByLabelText(/^Project$/)
        .click({force: true})
        .type('scratch{enter}')
      cy.findByLabelText(/^Scenario$/)
        .click({force: true})
        .type('baseline{enter}')
      // change the mode
      cy.findByLabelText(/Identical request settings/i).uncheck({force: true})
      cy.findButton(/bike access mode/i).click()
    })

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
    cy.findByText(/Select a destination layer to see accessibility/)

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
    cy.findByText(/Select a destination layer to see accessibility/)
    region.defaultSpatialDataset.select()

    // Logistic function should cause "out of sync" after dataset selected
    cy.findByText(/Results are out of sync with settings/)
    cy.fetchResults()
    cy.findByText(/Analyze results/)
  })

  describe('presets', () => {
    it('CRUD a preset', function () {
      region.setupAnalysis()

      const name = Cypress.env('dataPrefix') + 'preset'
      const editedName = Cypress.env('dataPrefix') + 'edited preset name'
      // Preset select does not exist without first creating a preset
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findButton(/Save/).click()
      })
      cy.findByLabelText(/Name/).type(name)
      cy.findButton(/Create preset/).click()
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Created new preset/)

      // Preset selector should now exist
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findByLabelText(/Active preset/)
          .click({force: true})
          .type(`${name}{enter}`)
      })

      // Edit the preset name
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findButton(/Edit preset name/).click()
      })
      cy.findByRole('dialog').within(() => {
        cy.findByLabelText(/Name/).dblclick().type('edited name')
        cy.findButton(/Save/).click()
      })
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Saved changes to preset/)
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findAllByLabelText(/Active preset/)
          .click({force: true})
          .type(`${editedName}{enter}`)
      })

      // Delete the preset
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findButton(/Delete selected preset/).click()
      })
      cy.findButton(/Confirm/).click()
      cy.findByRole('dialog').should('not.exist')
      cy.findByText(/Deleted selected preset/)
    })
  })
})
