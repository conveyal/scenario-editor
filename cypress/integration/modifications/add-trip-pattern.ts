import {LatLngTuple} from 'leaflet'
import {getDefaultRegion, scratchRegion} from '../utils'

describe('Add Trip Pattern', () => {
  const region = getDefaultRegion()
  const timetableName = 'Weekday'
  const project = region.getProject('Add Trip Pattern')

  describe('Copy Timetables', () => {
    const mod = project.getModification({
      type: 'Add Trip Pattern',
      data: {
        segments: [],
        timetables: []
      }
    })

    // Clean up any failed tests
    before(() => {
      project.deleteModification(mod.name + ' (copy)')
    })

    it('create and reuse timetables', () => {
      mod.navTo()
      // add a route geometry
      cy.drawRouteGeometry(scratchRegion.newRoute as L.LatLngTuple[])

      cy.findByText(/Add new timetable/).click()
      cy.findByText('Timetable 1').click({force: true})
      // enter arbitrary settings to see if they get saved
      cy.findByLabelText('Name').clear().type(timetableName)
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
      cy.findByText(timetableName).click({force: true}) // hide panel

      // Copy the current modification and navigate to it by clicking the toast
      cy.findByRole('button', {name: /Copy modification/i}).click()
      cy.loadingComplete()
      cy.get('#react-toast').findByRole('alert').click({force: true})
      cy.navComplete()

      cy.findByText(/Copy existing timetable/).click()
      cy.findByRole('dialog').within(() => {
        cy.findByText(/Loading/).should('not.exist')
        cy.findByLabelText(/Region/).select(region.name)
        cy.findByLabelText(/Project/).select(project.name)
        cy.findByLabelText(/Modification/).select(mod.name)
        cy.findByLabelText(/Timetable/).select(timetableName)
      })
      cy.findByText(/Copy into new timetable/i).click()
      cy.contains(`Copy of ${timetableName}`).click({force: true})
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
        .should('eq', '00:20:00')
      cy.findByLabelText(/Start time/)
        .invoke('val')
        .should('eq', '06:00')
      cy.findByLabelText(/End time/)
        .invoke('val')
        .should('eq', '23:00')

      // Delete the copied modification
      cy.deleteThisModification()
    })
  })

  describe('Geometry Editing', () => {
    const mod = project.getModification({type: 'Add Trip Pattern'})

    // Reset segments on each go
    beforeEach(() => {
      mod.navTo()
      cy.editModificationJSON({
        segments: []
      })
      cy.findButton(/Edit route geometry/).click()
    })

    afterEach(() => {
      cy.findButton(/Stop editing/).click()
    })

    it('create a single line with two clicks', () => {
      cy.clickMapAtCoord([39.08, -84.48])
      cy.clickMapAtCoord([39.08, -84.49])
      cy.findByText(/2 stops over/).should('exist')
    })

    it('can disable extending', () => {
      cy.clickMapAtCoord([39.08, -84.48])
      cy.clickMapAtCoord([39.08, -84.49])
      cy.findByLabelText(/^Extend$/).uncheck({force: true})
      cy.clickMapAtCoord([39.08, -84.5])
      cy.get('#react-toast').findByRole('alert')
      cy.findByLabelText(/^Extend$/).check({force: true})
    })

    it('drag new stops', () => {
      cy.clickMapAtCoord([39.08, -84.48])

      const lastCoord: L.LatLngTuple = [39.08, -84.49]
      cy.clickMapAtCoord(lastCoord)
      cy.findByText(/2 stops over 0.8/)

      const newCoord: L.LatLngTuple = [39.08, -84.5]
      const tempCoord: L.LatLngTuple = [39.09, -84.5]

      cy.dragMarker('Stop 1', lastCoord, newCoord)
      cy.findByText(/2 stops over 1.7/)

      cy.dragMarker('Stop 1', newCoord, tempCoord)
      cy.findByText(/2 stops over 2/)

      cy.dragMarker('Stop 1', tempCoord, newCoord)
      cy.findByText(/2 stops over 1.7/)
    })

    it('insert a new stop along a line', () => {
      cy.clickMapAtCoord([39.08, -84.48])
      cy.clickMapAtCoord([39.08, -84.5])
      cy.findByText(/2 stops over 1.7/)

      // Click a point along the existing route to add a new one
      cy.clickMapAtCoord([39.08, -84.49])
      cy.findByText(/3 stops over 1.7/)
    })

    it('drag inserted stops to new locations', () => {
      cy.clickMapAtCoord([39.08, -84.48])
      cy.clickMapAtCoord([39.08, -84.5])
      cy.findByText(/2 stops over 1.7/)

      // Click a point along the existing route to add a new one
      const coord: L.LatLngTuple = [39.08, -84.49]
      const newCoord: L.LatLngTuple = [39.09, -84.49]
      cy.clickMapAtCoord(coord)
      cy.dragMarker('Stop 1', coord, newCoord)
      cy.findByText(/3 stops over 2/)
    })

    it('handles many inserted and dragged stops', () => {
      const step = 0.01
      const steps = 5
      const startLat = 39.08
      const endLat = startLat + step * steps
      const startLon = -84.48
      const endLon = startLon + step * steps

      // Click at the start and the end
      cy.clickMapAtCoord([startLat, startLon])
      cy.clickMapAtCoord([endLat, endLon])

      // Insert stops along each step along the line
      let lat = startLat + step
      let lon = startLon + step
      while (lat < endLat && lon < endLon) {
        cy.clickMapAtCoord([lat, lon])
        lat += step
        lon += step
      }

      // View entire modification
      cy.findByLabelText(/Fit map to modification extents/).click()

      // Move each stop to a new point
      lat = startLat
      lon = startLon
      for (let i = 0; i <= steps; i++) {
        const even = i % 2 === 0
        const latInc = even ? step : 0
        const lonInc = even ? 0 : step
        cy.dragMarker(`Stop ${i}`, [lat, lon], [lat + latInc, lon + lonInc])
        lat += step
        lon += step
      }
    })
  })

  describe('Bugfixes', () => {
    const mod = project.getModification({
      name: 'ATP Bugfixes',
      type: 'Add Trip Pattern',
      data: {
        segments: []
      }
    })

    // Reset segments on each go
    beforeEach(() => {
      mod.navTo()
      cy.editModificationJSON({
        segments: []
      })
    })

    /**
     * Test proper control point placement and dragging when editing.
     * ref https://github.com/conveyal/analysis-ui/issues/1432
     *
     * This issue was solved by correcting `stopIndex` to `stop.index` when passing it to the `onStopDragEnd` method in
     * the Stops component of the TransitEditor.
     *
     * `stopIndex` referred to the index of the stop in the array of ONLY stops, while `stop.index` refers to the
     * index in the array of stops, control points, and auto-created stops -- which is generated from the segments array.
     */
    it('can edit alignments downstream of control points', () => {
      const lat = 39.08
      const c1: LatLngTuple = [lat, -84.401]
      const c2: LatLngTuple = [lat, -84.402]
      const c3: LatLngTuple = [lat, -84.403]
      const c4: LatLngTuple = [lat, -84.404]
      const c5: LatLngTuple = [lat, -84.405]

      // Example 1
      cy.findButton(/Edit route geometry/).click()

      cy.clickMapAtCoord(c1)
      cy.clickMapAtCoord(c2)

      // Make the second stop a control point
      cy.clickMapAtCoord(c2)
      cy.findButton(/make control point/i).click()

      // Create a 2nd stop and drag it to the 4th location
      cy.clickMapAtCoord(c3)
      cy.dragMarker('Stop 2', c3, c4)

      // 4th location should contain a stop, and therefore "make control point" button
      cy.clickMapAtCoord(c4)
      cy.findButton(/make control point/i)
      cy.findByText(/2 stops over 0\.26 km/).should('exist')

      // Reset
      cy.findButton(/Stop editing/).click()
      cy.editModificationJSON({
        segments: []
      })

      // Example 2
      cy.findButton(/Edit route geometry/).click()
      cy.clickMapAtCoord(c1)
      cy.clickMapAtCoord(c2)
      cy.clickMapAtCoord(c3)

      // Convert the 3rd and 2nd stops to control points
      cy.clickMapAtCoord(c3)
      cy.findButton(/make control point/i).click()
      cy.clickMapAtCoord(c2)
      cy.findButton(/make control point/i).click()

      // Create a 2nd stop and move to 5th location
      cy.clickMapAtCoord(c4)
      cy.dragMarker('Stop 2', c4, c5)

      // 5th location should contain a stop, and therefore "make control point" button
      cy.clickMapAtCoord(c5)
      cy.findButton(/make control point/i).click()
      cy.findByText(/1 stop/)
    })
  })
})
