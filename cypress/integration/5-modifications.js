const modificationPrefix = Cypress.env('dataPrefix') + 'MOD'
const createModName = (type, description = '') =>
  `${modificationPrefix}${type}${description}${Date.now()}`

const scenarioName = Cypress.env('dataPrefix') + 'SCENARIO'
const scenarioNameRegEx = new RegExp(scenarioName, 'g')

const getMap = () => cy.get('div.leaflet-container')

// All modification types
const types = [
  'Add Streets',
  'Add Trip Pattern',
  'Adjust Dwell Time',
  'Adjust Speed',
  'Convert To Frequency',
  'Modify Streets',
  'Remove Stops',
  'Remove Trips',
  'Reroute',
  'Custom'
]

function setupScenario(name) {
  // open the scenarios tab
  cy.findByRole('tab', {name: 'Scenarios'}).click()
  cy.get('#scenarios').then((el) => {
    // create named scenario if it doesn't already exist
    if (!el.text().includes(name)) {
      cy.findByRole('button', {name: 'Create a scenario'}).click()
      // TODO there has GOT to be a better way...
      cy.wrap(el)
        .findByText(/Scenario \d/)
        .parent()
        .parent()
        .parent()
        .click()
        .parent()
        .findByDisplayValue(/Scenario \d/)
        .type(name + '{enter}')
    }
  })
  cy.findAllByRole('tab', {name: /Modifications/g}).click()
}

// Delete an open modification
function deleteThisMod() {
  cy.findByRole('button', {name: 'Delete modification'}).click()
  cy.findByRole('button', {name: 'Confirm: Delete modification'}).click()
}

function openMod(modType, modName) {
  // opens the first listed modification of this type with this name
  cy.navTo('Edit Modifications')
  cy.findByRole('tab', {name: /Modifications/g}).click()
  // find the container for this modification type and open it if need be
  cy.findByText(modType)
    .parent()
    .parent()
    .as('modList')
    .then((modList) => {
      if (!modList.text().includes(modName)) {
        cy.get(modList).click()
      }
    })
  cy.get('@modList').contains(modName).click()
  cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
  cy.contains(modName)
}

function deleteMod(modType, modName) {
  openMod(modType, modName)

  cy.findByRole('button', {name: 'Delete modification'}).click()
  cy.findByRole('button', {name: 'Confirm: Delete modification'}).click()
  cy.contains('Create a modification')
  cy.findByText(modName).should('not.exist')
}

function setupMod(modType, modName) {
  // assumes we are already on this page or editing another mod
  cy.findByText('Create a modification').click()
  cy.findByLabelText(/Modification name/i).type(modName)
  if (modType.indexOf('Street') > -1) {
    cy.findByText('Street').click()
    cy.findByLabelText(/Street modification type/i).select(modType)
  } else {
    cy.findByLabelText(/Transit modification type/i).select(modType)
  }
  cy.findByText('Create').click()
  cy.findByRole('dialog').should('not.exist')
  cy.navComplete()
  cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
}

function drawRouteGeometry(newRoute) {
  cy.findByText(/Edit route geometry/i)
    .click()
    .contains(/Stop editing/i)
  cy.window().then((win) => {
    const map = win.LeafletMap
    const route = win.L.polyline(newRoute)
    map.fitBounds(route.getBounds(), {animate: false})
    cy.waitForMapToLoad()
    // click at the coordinates
    const coords = route.getLatLngs()
    coords.forEach((point, i) => {
      const pix = map.latLngToContainerPoint(point)
      getMap().click(pix.x, pix.y)
      if (i > 0) {
        cy.contains(new RegExp(i + 1 + ' stops over \\d\\.\\d+ km'))
      }
    })
    // convert an arbitrary stop to a control point
    const stop = coords[coords.length - 2]
    const pix = map.latLngToContainerPoint(stop)
    getMap().click(pix.x, pix.y)
    getMap()
      .findByText(/make control point/)
      .click()
    // control point not counted as stop
    cy.contains(new RegExp(coords.length - 1 + ' stops over \\d\\.\\d+ km'))
    // convert control point back to stop
    getMap().click(pix.x, pix.y)
    getMap()
      .findByText(/make stop/)
      .click()
    cy.contains(new RegExp(coords.length + ' stops over \\d\\.\\d+ km'))
  })
  cy.findByText(/Stop editing/i).click()
}

describe('Modifications', function () {
  before(() => {
    cy.fixture('regions/scratch.json').then((data) => {
      this.region = data
    })
    cy.setup('project')
    setupScenario(scenarioName)
  })

  beforeEach(() => {
    cy.getPseudoFixture().then((s) => {
      cy.navTo('regions')
      cy.visit(`/regions/${s.regionId}/projects/${s.projectId}/modifications`)
      return cy.navComplete()
    })
    cy.findByRole('tab', {name: /Modifications/g}).click()
  })

  describe('CRUD each type', () => {
    types.forEach((type) => {
      it(`CRUD ${type}`, () => {
        const name = createModName(type, 'simple')
        const description = 'distinctly descriptive text'
        const updatedDescription = 'updated description'
        // Create the modification
        setupMod(type, name)
        cy.contains(name)
        cy.findByText(/Add description/)
          .parent() // necessary because text element becomes detached
          .parent()
          .click({force: true})
          .type(description)
        cy.findByLabelText(/Default/).uncheck({force: true})
        cy.findByLabelText(scenarioNameRegEx).check({force: true})
        // Read the saved settings
        cy.navTo('Edit Modifications')
        openMod(type, name)
        cy.findByText(description)
        cy.findByLabelText(/Default/).should('not.be.checked')
        cy.findByLabelText(scenarioNameRegEx).should('be.checked')
        // Update something trivial
        cy.findByText(description)
          .parent() // necessary because text element becomes detached
          .parent()
          .click()
          .type(updatedDescription)
        cy.navTo('Edit Modifications')
        openMod(type, name)
        cy.findByText(updatedDescription)
        // Delete the modification
        deleteThisMod()
      })
    })
  })

  describe('Add Streets', () => {
    it('has working form elements', () => {
      const modName = createModName('AS', 'form')
      const force = {force: true}
      setupMod('Add Streets', modName)
      cy.findByLabelText(/Enable walking/i).as('walkAccess')
      cy.findByLabelText(/Enable biking/i).as('bikeAccess')
      cy.findByLabelText(/Enable driving/i).as('carAccess')
      // toggling access changes options
      // WALK
      cy.findByLabelText(/Walk time factor/i)
      cy.get('@walkAccess').uncheck(force)
      cy.findByLabelText(/Walk time factor/i).should('not.exist')
      // BIKE
      cy.findByLabelText(/Bike time factor/i)
      cy.findByLabelText(/Bike level of Traffic Stress/i)
      cy.get('@bikeAccess').uncheck(force)
      cy.findByLabelText(/Bike time factor/i).should('not.exist')
      cy.findByLabelText(/Bike level of Traffic Stress/i).should('not.exist')
      // DRIVE
      cy.findByLabelText(/Car speed/i)
      cy.get('@carAccess').uncheck(force)
      cy.findByLabelText(/Car speed/i).should('not.exist')
      // map interaction
      cy.findByTitle(/Draw a polyline/i)
      deleteThisMod()
    })
  })

  describe('Modify Streets', () => {
    it('has working form elements', () => {
      const modName = createModName('MS', 'form')
      const force = {force: true}
      setupMod('Modify Streets', modName)
      cy.findByLabelText(/Enable walking/i).as('walkAccess')
      cy.findByLabelText(/Enable biking/i).as('bikeAccess')
      cy.findByLabelText(/Enable driving/i).as('carAccess')
      // toggling access changes options
      // WALK
      cy.findByLabelText(/Walk time factor/i)
      cy.get('@walkAccess').uncheck(force)
      cy.findByLabelText(/Walk time factor/i).should('not.exist')
      // BIKE
      cy.findByLabelText(/Bike time factor/i)
      cy.findByLabelText(/Bike level of Traffic Stress/i)
      cy.get('@bikeAccess').uncheck(force)
      cy.findByLabelText(/Bike time factor/i).should('not.exist')
      cy.findByLabelText(/Bike level of Traffic Stress/i).should('not.exist')
      // DRIVE
      cy.findByLabelText(/Car speed/i)
      cy.get('@carAccess').uncheck(force)
      cy.findByLabelText(/Car speed/i).should('not.exist')
      // map interaction
      cy.findByTitle(/Draw a polygon/i)
      deleteThisMod()
    })
  })

  describe('Add Trip Pattern', () => {
    it('has working form elements', () => {
      // touches form elements not interacted with elsewhere
      const modName = createModName('ATP', 'form elements')
      setupMod('Add Trip Pattern', modName)
      cy.findByLabelText(/Transit Mode/i).select('Tram')
      cy.findAllByRole('alert').contains(/must have at least 2 stops/)
      cy.findByRole('button', {name: /Edit route geometry/i}).as('edit')
      cy.findAllByRole('alert').contains(/needs at least 1 timetable/)
      cy.findByRole('button', {name: /Add new timetable/i}).click()
      cy.findByRole('button', {name: /Timetable 1/}).click({force: true})
      cy.findByLabelText(/Times are exact/i).uncheck({force: true})
      cy.findByLabelText(/Phase at stop/i)
      // drawing a route activates the following elements
      drawRouteGeometry(this.region.newRoute)
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
        .invoke('val')
        .should('match', /\d+/i)
        .then((segSpeed) => {
          cy.get('@travelTime')
            .invoke('text')
            .then((initialTime) => {
              cy.findByLabelText(/Segment 1 speed/i)
                .clear()
                .type(segSpeed * 0.5)
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
      deleteThisMod()
    })

    it('can be imported from shapefile', () => {
      cy.findByRole('button', {
        name: 'Import modifications from another project'
      }).click()
      cy.location('pathname').should('match', /import-modifications$/)
      // TODO need better selector for button
      cy.get('a.btn').get('svg[data-icon="upload"]').click()
      cy.location('pathname').should('match', /import-shapefile/g)
      cy.findByLabelText(/Select Shapefile/i).attachFile({
        filePath: this.region.importRoutes.shapefile,
        mimeType: 'application/octet-stream',
        encoding: 'base64'
      })
      cy.findByLabelText(/Name/).select(this.region.importRoutes.nameField)
      cy.findByLabelText(/Frequency/).select(
        this.region.importRoutes.frequencyField
      )
      cy.findByLabelText(/Speed/).select(this.region.importRoutes.speedField)
      cy.findByText(/Import/)
        .should('not.be.disabled')
        .click()

      cy.location('pathname').should('match', /projects\/.{24}\/modifications/)

      this.region.importRoutes.routes.forEach((route) => {
        openMod('Add Trip Pattern', route.name)
        cy.findByRole('button', {name: 'Timetable NaN'}).click({force: true})
        cy.findByLabelText(/Frequency/)
          .invoke('val')
          .then((val) => expect(val).to.eq('' + route.frequency))
        cy.findByLabelText(/Average speed/i)
          .invoke('val')
          .then((val) => expect(val).to.eq('' + route.speed))
        deleteThisMod()
      })
    })

    it('can be drawn on map', () => {
      const modName = createModName('ATP', 'draw on map')
      setupMod('Add Trip Pattern', modName)
      cy.findAllByRole('alert').contains(/must have at least 2 stops/)
      cy.findAllByRole('alert').contains(/needs at least 1 timetable/)
      // add a route geometry
      drawRouteGeometry(this.region.newRoute)

      cy.findAllByRole('alert')
        .contains(/must have at least 2 stops/)
        .should('not.exist')
      cy.findByLabelText(/Auto-create stops at set spacing/i).check({
        force: true
      })

      cy.findByLabelText(/Bidirectional/i)
        .uncheck({force: true})
        .should('not.be.checked')
      // add a timetable
      cy.findByText(/Add new timetable/i).click()
      cy.findByRole('alert', {name: /needs at least 1 timetable/}).should(
        'not.exist'
      )
      deleteThisMod()
    })

    it('can create and reuse timetables', () => {
      const modName = createModName('ATP', 'timetable templates')
      setupMod('Add Trip Pattern', modName)
      // add a route geometry
      drawRouteGeometry(this.region.newRoute)

      cy.findByText(/Add new timetable/).click()
      cy.findByText('Timetable 1').click({force: true})
      // enter arbitrary settings to see if they get saved
      cy.findByLabelText('Name').clear().type('Weekday')
      cy.findByLabelText(/Mon/).check()
      cy.findByLabelText(/Tue/).check()
      cy.findByLabelText(/Wed/).check()
      cy.findByLabelText(/Thu/).check()
      cy.findByLabelText(/Fri/).check()
      cy.findByLabelText(/Sat/).uncheck({force: true})
      cy.findByLabelText(/Sun/).uncheck({force: true})
      cy.findByLabelText(/Frequency/)
        .clear()
        .type('00:20:00')
      cy.findByLabelText(/Start time/)
        .clear()
        .type('06:00')
      cy.findByLabelText(/End time/)
        .clear()
        .type('23:00')
      cy.findByLabelText(/dwell time/)
        .clear()
        .type('00:00:30')
      cy.findByText('Weekday').click({force: true}) // hide panel

      // Copy the current modification
      cy.findByRole('button', {name: /Copy modification/i}).click()
      cy.loadingComplete()
      cy.get('#react-toast').findByRole('alert').click({force: true})
      cy.navComplete()

      cy.findByText(/Copy existing timetable/).click()
      cy.findByRole('dialog').should('exist')
      cy.findByRole('dialog').as('dialog')
      cy.get('@dialog')
        .findByText(/Loading/)
        .should('not.exist')
      cy.get('@dialog')
        .findByLabelText(/Region/)
        .select(Cypress.env('dataPrefix') + 'scratch')
      cy.get('@dialog')
        .findByLabelText(/Project/)
        .select(Cypress.env('dataPrefix') + 'scratch project')
      cy.get('@dialog')
        .findByLabelText(/Modification/)
        .select(modName)
      cy.get('@dialog')
        .findByLabelText(/Timetable/)
        .select('Weekday')
      cy.findByText(/Copy into new timetable/i).click()
      cy.contains(/copy of Weekday/i).click({force: true})
      // verify the settings from above
      cy.findByLabelText(/Mon/).should('be.checked')
      cy.findByLabelText(/Tue/).should('be.checked')
      cy.findByLabelText(/Wed/).should('be.checked')
      cy.findByLabelText(/Thu/).should('be.checked')
      cy.findByLabelText(/Fri/).should('be.checked')
      cy.findByLabelText(/Sat/).should('not.be.checked')
      cy.findByLabelText(/Sun/).should('not.be.checked')
      cy.findByLabelText(/Frequency/)
        .invoke('val')
        .then((val) => expect(val).to.eq('00:20:00'))
      cy.findByLabelText(/Start time/)
        .invoke('val')
        .then((val) => expect(val).to.eq('06:00'))
      cy.findByLabelText(/End time/)
        .invoke('val')
        .then((val) => expect(val).to.eq('23:00'))
      // delete the temp modification
      deleteThisMod()
      // delete the template modification
      deleteMod('Add Trip Pattern', modName)
    })
  })

  describe('Adjust dwell time', () => {
    it('has working form elements', () => {
      const modName = createModName('ADT', 'form')
      setupMod('Adjust Dwell Time', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      cy.findByLabelText(/Scale existing dwell times by/i).click({force: true})
      cy.findByLabelText(/Set new dwell time to/i).click({force: true})
      deleteThisMod()
    })
  })

  describe('Adjust speed', () => {
    it('has working form elements', () => {
      const modName = createModName('AS', 'form')
      setupMod('Adjust Speed', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      cy.findByLabelText(/Scale speed by/i)
        .invoke('val')
        .then((val) => expect(val * 1).to.eq(1))
      deleteThisMod()
    })
  })

  describe('Convert to frequency', () => {
    it('has working form elements', () => {
      const modName = createModName('CTF', 'form')
      setupMod('Convert To Frequency', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
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
      deleteThisMod()
    })
  })

  describe('Remove stops', () => {
    /*
      can test this with the 25X by removing few stops in downtown
      need to determine when this line runs (probably standard peak service)
    */
    it('has working form elements', () => {
      const modName = createModName('RS', 'form')
      let testCase = this.region.testCases.removeStops
      setupMod('Remove Stops', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(testCase.routeName + '{enter}')
      // can't interact with these yet - leave all at defaults
      cy.findByLabelText(/Select patterns/i)
      cy.findByLabelText(/Time savings per removed stop/i)
      // select stops
      //cy.get('a.btn').contains('New').click()
      //cy.get('div.leaflet-container').as('map')
      deleteThisMod()
    })
  })

  describe('Remove trips', () => {
    it('has working form elements', () => {
      const modName = createModName('RT', 'form')
      setupMod('Remove Trips', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      deleteThisMod()
    })
  })

  describe('Reroute', () => {
    it('has working form elements', () => {
      const modName = createModName('RR', 'form')
      setupMod('Reroute', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      // verify existence only
      cy.findByLabelText(/Select patterns/i)

      // Select from stop and to stop
      cy.window().then((win) => {
        const map = win.LeafletMap
        cy.findByLabelText(/Select from stop/).click()
        let p1 = map.latLngToContainerPoint([39.0877, -84.5192])
        getMap().click(p1.x, p1.y)
        // test clearing the from stop
        cy.findByLabelText(/Clear from stop/).click()

        // Re-select the from stop
        cy.findByLabelText(/Select from stop/).click()
        getMap().click(p1.x, p1.y)

        // Select the to stop
        cy.findByLabelText(/Select to stop/).click()
        let p2 = map.latLngToContainerPoint([39.1003, -84.4855])
        getMap().click(p2.x, p2.y)
      })

      cy.findByLabelText(/Default dwell time/i).type('00:10:00')
      cy.findByLabelText(/Average speed/i).type('25')
      cy.findByLabelText(/Total moving time/i).type('01:00:00')

      deleteThisMod()
    })
  })
})
