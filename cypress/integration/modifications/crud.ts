/**
 * Basic Modification Tests
 *
 * CRUD, form validation, and map interactions for all types.
 * Tests that verify analysis results should go in the
 * Advanced Modifications group.
 */
import {getDefaultRegion, ModificationTypes, scratchRegion} from '../utils'

const scenarioName = Cypress.env('dataPrefix') + 'SCENARIO'
const scenarioNameRegEx = new RegExp(scenarioName, 'g')

describe('CRUD Modification Tests', () => {
  const region = getDefaultRegion()
  const project = region.getProject('Modification Form Test')
  project.getScenarios([scenarioName])
  const mods = ModificationTypes.map((type) => project.getModification({type}))

  // Test deletion. During development comment out to speed up.
  after(() => mods.forEach((mod) => mod.delete()))

  /**
   * Repeat the same modification simple tests for each modification type.
   * Each modification contains the same basic form element indicating that
   * they may not need to be tested individually. But instances have occured
   * where the invidiual modification bodies have caused elements outside of
   * the modification to fail or work incorrectly. Therefore it is necessary
   * run these simple tests for each modification type.
   */
  mods.forEach((mod, i) => {
    const type = ModificationTypes[i]
    it(`${type}: should handle basic modification editing`, () => {
      mod.navTo()

      const description = 'distinctly descriptive text'
      // Update the description
      cy.findByRole('group', {name: /Add description/}).click()

      cy.focused().type(description)

      // Update the variants
      cy.findAllByText('Active in scenarios')
        .parent()
        .within(() => {
          cy.findByLabelText(/Default/).uncheck({force: true})
          cy.findByLabelText(scenarioNameRegEx).check({force: true})
        })

      // Test the type specific elements
      formCheck(type)

      // Navigate away and expand the map to the modification
      cy.centerMapOn([0, 0])
      cy.findByRole('button', {
        name: /Fit map to modification extents/
      }).click()

      // Go back to the list to force a save
      cy.findByRole('button', {name: /^Modifications$/}).click()
      cy.navComplete()

      // Read the saved settings
      mod.navTo()

      cy.findByText(description)
      cy.findAllByText('Active in scenarios')
        .parent()
        .within(() => {
          cy.findByLabelText(/Default/).should('not.be.checked')
          cy.findByLabelText(scenarioNameRegEx).should('be.checked')
        })
    })
  })

  it('can be imported from shapefile', function () {
    project.navTo()

    cy.findByRole('button', {
      name: 'Import modifications from another project'
    }).click()
    cy.navComplete()

    cy.findByRole('button', {name: /Import from Shapefile/}).click()
    cy.navComplete()

    cy.findByLabelText(/Select Shapefile/i).attachFile({
      filePath: scratchRegion.importRoutes.shapefile,
      mimeType: 'application/octet-stream',
      encoding: 'base64'
    })
    cy.findByLabelText(/Name/).select(scratchRegion.importRoutes.nameField)
    cy.findByLabelText(/Frequency/).select(
      scratchRegion.importRoutes.frequencyField
    )
    cy.findByLabelText(/Speed/).select(scratchRegion.importRoutes.speedField)
    cy.findByText(/Import/)
      .should('not.be.disabled')
      .click()
    cy.navComplete()

    cy.location('pathname').should('match', /projects\/.{24}\/modifications/)

    scratchRegion.importRoutes.routes.forEach((route) => {
      project.navTo()
      cy.openModification(route.name)

      cy.findByRole('button', {name: /Timetable 1/}).click({force: true})
      cy.findByLabelText(/Frequency/)
        .invoke('val')
        .then((val) => expect(val).to.eq('' + route.frequency))
      cy.findByLabelText(/Average speed/i)
        .invoke('val')
        .then((val) => expect(val).to.eq('' + route.speed))

      cy.deleteThisModification()
    })
  })

  describe('Download and share modifications', () => {
    before(() => {
      cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
          command: 'Page.setDownloadBehavior',
          params: {behavior: 'allow', downloadPath: 'cypress/downloads'}
        }),
        {log: false}
      )
    })

    it('should download the scenario, routes, and stops', () => {
      project.navTo()

      cy.findByRole('button', {name: /Download or share this project/}).click()

      cy.findAllByRole('button', {name: /Raw scenario/})
        .first()
        .click()

      cy.findAllByRole('button', {name: /New alignments/})
        .first()
        .click()

      cy.findAllByRole('button', {name: /New stops/})
        .first()
        .click()

      cy.findByRole('button', {name: /Close/}).click()
    })

    it('should show a report of all the modifications', () => {
      project.navTo()

      cy.findByRole('button', {name: /Download or share this project/}).click()

      cy.findByRole('dialog').within(() => {
        cy.findByText(scenarioNameRegEx)
          .parent()
          .within(() => {
            cy.findAllByRole('button', {name: /Summary Report/i}).click()
          })
      })

      cy.findByRole('dialog').should('not.exist')

      mods.forEach((mod) => {
        cy.findByText(mod.name)
      })
    })
  })
})

/**
 * Choose which set of tests to run depending on the modification type.
 * The following tests should be basic. Checking the existence of form
 * elements and whether or not they work as intended -- including form
 * validation. Tests for how these modifications affect results should
 * go in the "Advanced Modifications" group.
 */
function formCheck(type: Cypress.ModificationType) {
  switch (type) {
    case 'Add Trip Pattern':
      return testAddTripPattern()
    case 'Add Streets':
      return testAddStreets()
    case 'Adjust Dwell Time':
      return testAdjustDwellTime()
    case 'Adjust Speed':
      return testAdjustSpeed()
    case 'Convert To Frequency':
      return testConvertToFrequency()
    case 'Modify Streets':
      return testModifyStreets()
    case 'Remove Stops':
      return testRemoveStops()
    case 'Remove Trips':
      return testRemoveTrips()
    case 'Reroute':
      return testReroute()
    default:
      console.log('Not yet implemented...')
      break
  }
}

function testAddStreets() {
  const force = {force: true}
  cy.findByLabelText(/Enable walking/i).as('walkAccess')
  cy.findByLabelText(/Enable biking/i).as('bikeAccess')
  cy.findByLabelText(/Enable driving/i).as('carAccess')
  // toggling access changes options
  // WALK
  cy.get('@walkAccess').uncheck(force)
  cy.findByLabelText(/Walk time factor/i).should('not.exist')
  cy.get('@walkAccess').check(force)
  cy.findByLabelText(/Walk time factor/i)

  // BIKE
  cy.get('@bikeAccess').uncheck(force)
  cy.findByLabelText(/Bike time factor/i).should('not.exist')
  cy.findByLabelText(/Bike level of Traffic Stress/i).should('not.exist')
  cy.get('@bikeAccess').check(force)
  cy.findByLabelText(/Bike time factor/i)
  cy.findByLabelText(/Bike level of Traffic Stress/i)

  // DRIVE
  cy.get('@carAccess').uncheck(force)
  cy.findByLabelText(/Car speed/i).should('not.exist')
  cy.get('@carAccess').check(force)
  cy.findByLabelText(/Car speed/i)

  // map interaction
  cy.findByTitle(/Draw a polyline/i)
}

function testAddTripPattern() {
  cy.findByLabelText(/Transit Mode/i).select('Tram')
  cy.findAllByRole('alert').contains(/must have at least 2 stops/)
  cy.findByRole('button', {name: /Edit route geometry/i}).as('edit')

  cy.findAllByRole('alert').contains(/needs at least 1 timetable/)
  cy.findByRole('button', {name: /Add new timetable/i}).click()
  cy.findAllByRole('alert')
    .contains(/needs at least 1 timetable/)
    .should('not.exist')
  cy.findByRole('button', {name: /Timetable 1/}).click({force: true})

  cy.findByLabelText(/Times are exact/i).uncheck({force: true})
  cy.findByLabelText(/Phase at stop/i)
  // drawing a route activates the following elements
  cy.drawRouteGeometry(scratchRegion.newRoute as L.LatLngTuple[])
  cy.findAllByRole('alert')
    .contains(/must have at least 2 stops/)
    .should('not.exist')

  // set dwell times, verifying that they increase the total travel time
  cy.findByText(/Travel time/i)
    .parent()
    .findByText(/\d\d:\d\d:\d\d/)
    .as('travelTime')
    .invoke('text')
    .then((initialTime) => {
      // now set a new dwell time
      const dwellTime = '00:00:30'
      cy.findByLabelText(/Default dwell time/i)
        .clear()
        .type(dwellTime)
      cy.findByRole('button', {
        name: /Set individual stop dwell times/i
      }).click()
      cy.findByLabelText(/Stop 1/)
        .invoke('attr', 'placeholder')
        .should('eq', `${dwellTime} (default)`)
      cy.get('@travelTime')
        .invoke('text')
        .then(
          // compares interval strings, but because of the format it works
          (newTime) => expect(newTime > initialTime).to.be.true
        )
    })
  // set segment speeds
  cy.findByLabelText(/Average speed/i)
  cy.findByLabelText(/Total moving time/i)
  cy.findByRole('button', {name: /Set individual segment speeds/i}).click()
  // decreasing segment speed should increase travel time
  cy.findByLabelText(/Segment 1 speed/i)
    .itsNumericValue()
    .should('not.be.NaN')
    .then((segSpeed) => {
      cy.get('@travelTime')
        .invoke('text')
        .then((initialTime) => {
          cy.findByLabelText(/Segment 1 speed/i)
            .clear()
            .type(`${segSpeed * 0.5}`)
          cy.get('@travelTime')
            .invoke('text')
            .then((newTime) => {
              cy.log(newTime, initialTime)
              expect(newTime > initialTime).to.be.true
            })
        })
    })
  cy.findByLabelText(/Segment 1 duration/i)
    .invoke('val')
    .should('match', /\d\d:\d\d:\d\d/)
}

function testAdjustDwellTime() {
  cy.findByLabelText(/Select patterns/i)
  cy.findByLabelText(/Scale existing dwell times by/i).click({force: true})
  cy.findByLabelText(/Set new dwell time to/i).click({force: true})
}

function testAdjustSpeed() {
  cy.findByLabelText(/Select patterns/i)
  cy.findByLabelText(/Scale speed by/i)
    .itsNumericValue()
    .should('eq', 1)
}

function testConvertToFrequency() {
  cy.findByLabelText(/retain existing scheduled trips/i).click({
    force: true
  })
  cy.findByText(/Add frequency entry/i).click()
  cy.findByLabelText(/Select patterns/i)
    .click({force: true})
    .type('Bakewell{enter}')
  cy.findByLabelText(/Frequency/i)
    .clear()
    .type('00:20:00')
  cy.findByLabelText(/Start time/i)
    .clear()
    .type('09:00')
  cy.findByLabelText(/End time/i)
    .clear()
    .type('23:00')
  cy.findByLabelText(/Phase at stop/i)
    .click({force: true})
    .type('Fountain Square{enter}')
  cy.findByRole('button', {name: 'Delete frequency entry'}).click()
  cy.findByRole('button', {name: 'Confirm: Delete frequency entry'}).click()
}

function testModifyStreets() {
  const force = {force: true}
  cy.findByLabelText(/Enable walking/i).as('walkAccess')
  cy.findByLabelText(/Enable biking/i).as('bikeAccess')
  cy.findByLabelText(/Enable driving/i).as('carAccess')

  // toggling access changes options
  // WALK
  cy.findByLabelText(/Walk time factor/i)
  cy.get('@walkAccess').uncheck(force)
  cy.findByLabelText(/Walk time factor/i).should('not.exist')
  cy.get('@walkAccess').check(force)

  // BIKE
  cy.findByLabelText(/Bike time factor/i)
  cy.findByLabelText(/Bike level of Traffic Stress/i)
  cy.get('@bikeAccess').uncheck(force)
  cy.findByLabelText(/Bike time factor/i).should('not.exist')
  cy.findByLabelText(/Bike level of Traffic Stress/i).should('not.exist')
  cy.get('@bikeAccess').check(force)

  // DRIVE
  cy.findByLabelText(/Car speed/i)
  cy.get('@carAccess').uncheck(force)
  cy.findByLabelText(/Car speed/i).should('not.exist')
  cy.get('@carAccess').check(force)

  // map interaction
  cy.findByTitle(/Draw a polygon/i)
}

function testRemoveTrips() {
  cy.findByLabelText(/Select patterns/i)
}

function testRemoveStops() {
  // can't interact with these yet - leave all at defaults
  cy.findByLabelText(/Select patterns/i)
  cy.findByLabelText(/Time savings per removed stop/i)
  // select stops
  //cy.get('a.btn').contains('New').click()
  //cy.get('div.leaflet-container').as('map')
}

function testReroute() {
  // verify existence only
  cy.findByLabelText(/Select patterns/i)

  // Select from stop and to stop
  cy.findByLabelText(/Select from stop/).click()
  cy.clickMapAtCoord([39.0877, -84.5192])
  // test clearing the from stop
  cy.findByLabelText(/Clear from stop/).click()

  // Re-select the from stop
  cy.findByLabelText(/Select from stop/).click()
  cy.clickMapAtCoord([39.0877, -84.5192])

  // Select the to stop
  cy.findByLabelText(/Select to stop/).click()
  cy.clickMapAtCoord([39.1003, -84.4855])

  cy.findByLabelText(/Default dwell time/i).type('00:10:00')
  cy.findByLabelText(/Average speed/i).type('25')
  cy.findByLabelText(/Total moving time/i).type('01:00:00')
}
