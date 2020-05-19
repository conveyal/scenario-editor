// use lodash .random
const {random} = Cypress._

describe('Modifications', () => {
  before(() => {
    cy.setupProject('scratch')
    cy.setupScenario('scratch scenario')
  })

  after(() => {
    cy.deleteScenario('scratch scenario')
    //cy.deleteProject('scratch project')
  })

  beforeEach(() => {
    cy.fixture('regions/scratch.json').as('region')
    cy.navTo(/Edit Modifications/)
  })

  it('can be created, saved, and deleted', function () {
    // create an arbitrary modification type
    // these actions should be the same across all types
    // TODO the types that are commented out are producing errors locally
    let mods = [
      'Add Trip Pattern',
      //'Adjust Dwell Time',
      'Adjust Speed',
      //'Convert To Frequency',
      'Remove Stops',
      'Remove Trips',
      'Reroute',
      'Custom'
    ]
    let modType = mods[random(0, mods.length - 1)]
    let modName = 'tempMod ' + Date.now()
    let description = 'descriptive text'
    cy.findByRole('link', {name: 'Create a modification'}).click()
    cy.findByLabelText(/Modification type/i).select(modType)
    cy.findByLabelText(/Modification name/i).type(modName)
    cy.findByRole('link', {name: 'Create'}).click()
    cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    cy.contains(modName)
    cy.findByRole('link', {name: /Add description/}).click()
    cy.findByLabelText('Description').type(description)
    // scenarios
    cy.findByLabelText(/Default/).uncheck({force: true})
    cy.findByLabelText(/scratch scenario/).check({force: true})
    // go back and check that everything saved
    cy.navTo(/Edit Modifications/)
    cy.openMod(modType, modName)
    cy.findByLabelText('Description').contains(description)
    cy.findByLabelText(/Default/).should('not.be.checked')
    cy.findByLabelText(/scratch scenario/).should('be.checked')
    cy.deleteThisMod()
  })

  describe('new trip patterns', () => {
    it('can be imported from shapefile', function () {
      cy.get('svg[data-icon="upload"]').click()
      cy.location('pathname').should('match', /import-modifications$/)
      // TODO need better selector for button
      cy.get('a.btn').get('svg[data-icon="upload"]').click()
      cy.location('pathname').should('match', /\/import-shapefile/)
      cy.fixture(this.region.importRoutes.shapefile).then((fileContent) => {
        cy.findByLabelText(/Select Shapefile/i).upload({
          fileContent,
          fileName: this.region.importRoutes.shapefile,
          mimeType: 'application/octet-stream',
          encoding: 'base64'
        })
      })
      cy.findByLabelText(/Name/).select(this.region.importRoutes.nameField)
      cy.findByLabelText(/Frequency/).select(
        this.region.importRoutes.frequencyField
      )
      cy.findByLabelText(/Speed/).select(this.region.importRoutes.speedField)
      cy.findByText(/Import/)
        .should('not.be.disabled')
        .click()
      cy.location('pathname').should('match', /projects\/.{24}$/)

      this.region.importRoutes.routes.forEach((route) => {
        cy.openMod('Add Trip Pattern', route.name)
        cy.findByText(/Timetable NaN/).click()
        cy.findByLabelText(/Frequency/)
          .invoke('val')
          .then((val) => expect(val).to.eq('' + route.frequency))
        cy.findByLabelText(/Average speed/i)
          .invoke('val')
          .then((val) => expect(val).to.eq('' + route.speed))
        cy.deleteThisMod()
      })
    })

    it('can be drawn on map', function () {
      let modName = Date.now() + ''
      cy.setupMod('Add Trip Pattern', modName)
      cy.findAllByRole('alert').contains(/must have at least 2 stops/)
      cy.findAllByRole('alert').contains(/needs at least 1 timetable/)
      // add a route geometry
      cy.findByText(/Edit route geometry/i)
        .click()
        .contains(/Stop editing/i)
      cy.get('div.leaflet-container').as('map')
      cy.window().then((win) => {
        let map = win.LeafletMap
        let route = win.L.polyline(this.region.newRoute)
        map.fitBounds(route.getBounds(), {animate: false})
        cy.waitForMapToLoad()
        // click at the coordinates
        let coords = route.getLatLngs()
        coords.forEach((point, i) => {
          let pix = map.latLngToContainerPoint(point)
          cy.get('@map').click(pix.x, pix.y)
          if (i > 0) {
            cy.contains(new RegExp(i + 1 + ' stops over \\d\\.\\d+ km'))
          }
        })
        // convert an arbitrary stop to a control point
        let stop = coords[random(0, coords.length - 1)]
        let pix = map.latLngToContainerPoint(stop)
        cy.get('@map').click(pix.x, pix.y)
        cy.get('@map')
          .findByText(/make control point/)
          .click()
        // control point not counted as stop
        cy.contains(new RegExp(coords.length - 1 + ' stops over \\d\\.\\d+ km'))
        // convert control point back to stop
        cy.get('@map').click(pix.x, pix.y)
        cy.get('@map')
          .findByText(/make stop/)
          .click()
        cy.contains(new RegExp(coords.length + ' stops over \\d\\.\\d+ km'))
      })
      cy.findByText(/Stop editing/i).click()
      cy.findAllByRole('alert')
        .contains(/must have at least 2 stops/)
        .should('not.exist')
      // add a timetable
      cy.findByText(/Add new timetable/i).click()
      cy.findByRole('alert', {name: /needs at least 1 timetable/}).should(
        'not.exist'
      )
      // add to scenario
      cy.findByLabelText(/Default/).uncheck({force: true})
      cy.findByLabelText(/scratch scenario/).should('be.checked')
      //
      cy.deleteThisMod()
    })

    it('can create and reuse timetables', function () {
      let modName = 'timetable templates'
      let modType = 'Add Trip Pattern'
      cy.setupMod(modType, modName)
      cy.findByText(/Add new timetable/).click()
      cy.findByText(/Timetable 1/).click()
      // enter arbitrary settings to see if they get saved
      cy.get('input[name="Name"]').clear().type('Weekday')
      cy.findByLabelText(/Mon/).check()
      cy.findByLabelText(/Tue/).check()
      cy.findByLabelText(/Wed/).check()
      cy.findByLabelText(/Thu/).check()
      cy.findByLabelText(/Fri/).check()
      cy.findByLabelText(/Sat/).uncheck()
      cy.findByLabelText(/Sun/).uncheck()
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
      // exit and create new mod to copy into
      cy.setupMod(modType, 'temp')
      cy.findByText(/Copy existing timetable/).click()
      cy.findByRole('dialog').as('dialog')
      cy.get('@dialog')
        .findByLabelText(/Region/)
        .select('scratch')
      cy.get('@dialog')
        .findByLabelText(/Project/)
        .select('scratch project')
      cy.get('@dialog')
        .findByLabelText(/Modification/)
        .select(modName)
      cy.get('@dialog')
        .findByLabelText(/Timetable/)
        .select('Weekday')
      cy.findByText(/Copy into new timetable/i).click()
      cy.contains(/copy of Weekday/i).click()
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
      cy.findByLabelText(/dwell time/)
        .invoke('val')
        .then((val) => expect(val).to.eq('00:00:30'))
      // delete the temp modification
      cy.deleteThisMod()
      // delete the template modification
      cy.deleteMod(modType, modName)
    })
  })

  describe('Adjust dwell time', () => {
    it('has working form elements', function () {
      let modName = Date.now() + ''
      cy.setupMod('Adjust Dwell Time', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      cy.findByLabelText(/Scale existing dwell times/i).check()
      cy.findByLabelText(/Set new dwell time to/i).check()
      cy.deleteThisMod()
    })
  })

  describe('Adjust speed', () => {
    it('has working form elements', function () {
      let modName = Date.now() + ''
      cy.setupMod('Adjust Speed', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      cy.deleteThisMod()
    })
  })

  describe('Convert to frequency', () => {
    it('has working form elements', function () {
      let modName = Date.now() + ''
      cy.setupMod('Convert To Frequency', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/retain existing scheduled trips/i).check()
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
      cy.findByText(/Delete frequency entry/i).click()
      cy.deleteThisMod()
    })
  })

  describe('Remove stops', () => {
    /*
      can test this with the 25X by removing few stops in downtown
      need to determine when this line runs (probably standard peak service)
    */
    it('has working form elements', function () {
      let modName = Date.now() + ''
      let testCase = this.region.testCases.removeStops
      cy.setupMod('Remove Stops', modName)
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
      cy.deleteThisMod()
    })
  })

  describe('Remove trips', () => {
    it('has working form elements', function () {
      let modName = Date.now() + ''
      cy.setupMod('Remove Trips', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      cy.findByLabelText(/Select patterns/i)
      cy.deleteThisMod()
    })
  })

  describe('Reroute', () => {
    it('has working form elements', function () {
      let modName = Date.now() + ''
      cy.setupMod('Reroute', modName)
      cy.findByLabelText(/Select feed/)
        .click({force: true})
        .type(this.region.feedAgencyName + '{enter}')
      cy.findByLabelText(/Select route/)
        .click({force: true})
        .type(this.region.sampleRouteName + '{enter}')
      // verify existence only
      cy.findByLabelText(/Select patterns/i)
      cy.findByText(/Start of reroute/i)
      cy.findByText(/End of reroute/i)
      cy.findByLabelText(/Default dwell time/i)
      cy.findByLabelText(/Average speed/i)
      cy.findByLabelText(/Total moving time/i)
      cy.deleteThisMod()
    })
  })
})
