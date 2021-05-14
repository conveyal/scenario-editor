import {getDefaultRegion} from '../utils'

const coordsOverAntiMeridian: L.LatLngTuple[] = [
  [5, 160],
  [5, 200]
]

const lineString: GeoJSON.LineString = {
  type: 'LineString',
  coordinates: [
    [160, 5],
    [200, 5]
  ]
}

const addTripSegment = {
  stopAtStart: true,
  stopAtEnd: true,
  spacing: 0,
  geometry: lineString
}

/**
 * Modifications that allow drawing can have problems when drawing over the anti-meridian.
 * This test ensures that these modifications both:
 * 1. Show alerts when drawing over the anti-meridian.
 * 2. Still open if they have invalid coordinates from undefined usage.
 *
 * Reported here: https://github.com/conveyal/analysis-ui/issues/1315
 */
describe('Modification drawing over anti-meridian', () => {
  const region = getDefaultRegion()
  const project = region.getProject('anti-meridian')

  describe('Add Trip Pattern', () => {
    const mod = project.getModification({
      type: 'Add Trip Pattern',
      data: {
        segments: []
      }
    })

    it('should handle anti-meridian drawing', () => {
      cy.waitForMapToLoad()
      cy.getLeafletMap().then((map) => map.fitBounds(coordsOverAntiMeridian))

      cy.findByRole('button', {name: /Edit route geometry/i}).click()
      coordsOverAntiMeridian.forEach((coord) => cy.clickMapAtCoord(coord))
      cy.findToast(/Invalid coordinate/) // Alert should pop up
      cy.findByRole('button', {name: /Stop editing/i}).click()

      // Save and re-open
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()

      // Edit the JSON directly
      cy.editModificationJSON({segments: [addTripSegment]})

      // Save and re-open and attempt to edit the route geometry
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()
      cy.findByRole('button', {name: /Edit route geometry/i}).click()
    })
  })

  describe('Reroute', () => {
    const mod = project.getModification({
      data: {
        segments: []
      },
      type: 'Reroute'
    })

    it('should handle anti-meridian drawing', () => {
      cy.findByLabelText(/Select from stop/).click()
      cy.clickStopOnMap(/Bakewell at 3rd - Out/)

      cy.findButton(/Edit route geometry/).click()
      coordsOverAntiMeridian.forEach((coord) => cy.clickMapAtCoord(coord))
      cy.findToast(/Invalid coordinate/) // Alert should pop up
      cy.findButton(/Stop editing/i).click()

      // Save and re-open
      cy.findButton(/^Modifications$/).click()
      mod.navTo()

      // Edit the JSON directly
      cy.editModificationJSON({segments: [addTripSegment]})

      // Save and re-open and attempt to edit the route geometry
      cy.findButton(/^Modifications$/).click()
      mod.navTo()
      cy.findButton(/Edit route geometry/i).click()
    })
  })

  describe('Add Streets', () => {
    const mod = project.getModification({
      type: 'Add Streets',
      data: {
        lineStrings: []
      }
    })

    it('should handle anti-meridian drawing', () => {
      cy.waitForMapToLoad()
      cy.getLeafletMap().then((map) => map.fitBounds(coordsOverAntiMeridian))

      cy.findByTitle(/Draw a polyline/i).click()
      coordsOverAntiMeridian.forEach((coord) => cy.clickMapAtCoord(coord))
      cy.findByRole('alert')
      cy.findByTitle(/Finish drawing/i).click()

      // Save and re-open
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()

      // Edit the JSON directly
      cy.editModificationJSON({lineStrings: [lineString.coordinates]})

      // Save and re-open
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()
    })
  })

  describe('Modify Streets', () => {
    const mod = project.getModification({
      type: 'Modify Streets',
      data: {
        polygons: []
      }
    })

    it('should handle anti-meridian drawing', () => {
      const withEndCoord = [
        ...coordsOverAntiMeridian,
        coordsOverAntiMeridian[0]
      ]

      cy.waitForMapToLoad()
      cy.getLeafletMap().then((map) => map.fitBounds(coordsOverAntiMeridian))

      cy.findByTitle(/Draw a polygon/i).click()
      withEndCoord.forEach((coord) => cy.clickMapAtCoord(coord))
      cy.findByRole('alert')
      cy.findByTitle(/Finish drawing/i).click()

      // Save and re-open
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()
      // Edit the JSON directly
      cy.editModificationJSON({
        polygons: [withEndCoord.map((c) => [c[1], c[0]])]
      })

      // Save and re-open
      cy.findByRole('button', {name: /^Modifications$/}).click()
      mod.navTo()
    })
  })
})
