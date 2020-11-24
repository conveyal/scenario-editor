import {getDefaultRegion, scratchRegion} from '../utils'

describe('Adjust Speed', () => {
  const routeName = '1 Dixie Hwy'
  const centralCoords: L.LatLngTuple = scratchRegion.locations
    .center as L.LatLngTuple
  const farFromRouteCoords: L.LatLngTuple = [39.021, -84.44] // Cold Spring
  const beGreater = ([v, b]) => expect(v).to.be.greaterThan(b)
  const beLess = ([v, b]) => expect(v).to.be.lessThan(b)
  const selectAll = () =>
    cy.findAllByRole('button', {name: /Select all routes/}).click()
  const scaleSpeedBy = (v: number) =>
    cy.findByLabelText('Scale speed by').clear().type(`${v}`)

  const region = getDefaultRegion()
  const project = region.getProject('Adjust Speed')

  // Set up the scenarios ahead of time for consistent variant lengths
  project.getScenarios(['All Routes', 'Single Route', 'Segments', 'Patterns'])

  describe('all routes selected', () => {
    const mod = project.getModification({
      data: {
        scale: 10,
        variants: [false, true, false, false, false]
      },
      name: 'All Routes',
      onCreate: () => {
        selectAll()
      },
      type: 'Adjust Speed'
    })

    it('should increase accessibility with increased speed', () => {
      region.setupAnalysis({project, scenario: 'All routes'})
      region.fetchAccessibilityComparison(centralCoords).should(beGreater)
    })

    it('should decrease accessibility with decreased speed', () => {
      mod.navTo()
      scaleSpeedBy(0.1)

      region.setupAnalysis({project, scenario: 'All routes'})
      region.fetchAccessibilityComparison(centralCoords).should(beLess)
    })
  })

  describe('single route selected', () => {
    const singleRouteMod = project.getModification({
      data: {
        scale: 10,
        variants: [false, false, true, false, false]
      },
      name: 'Single Route',
      onCreate: () => {
        cy.selectRoute(routeName)
      },
      type: 'Adjust Speed'
    })

    // Create a modification with a subset of segments selected.
    const [lat, lon] = centralCoords
    const offset = 0.03
    const segmentPolygonCoords: L.LatLngTuple[] = [
      [lat, lon + offset],
      [lat + offset, lon],
      [lat, lon - offset],
      [lat - offset, lon]
    ]
    project.getModification({
      data: {
        scale: 10,
        variants: [false, false, false, true, false]
      },
      name: 'Segments',
      onCreate: () => {
        cy.selectRoute(routeName)
        // Draw box around segments
        cy.findByRole('button', {name: /Select segments/}).click()
        cy.get('.leaflet-draw') // Wait for this to appear before clicking the map

        segmentPolygonCoords.forEach((ll) => cy.clickMapAtCoord(ll, 14))
        cy.clickMapAtCoord(segmentPolygonCoords[0], 14) // Closes the polygon

        // Add to, Remove from, and clear buttons should now exist
        cy.findByRole('button', {name: /Add to/})
      },
      type: 'Adjust Speed'
    })

    it('should increase accessibility with increased speed', () => {
      region.setupAnalysis({project, scenario: 'Single Route'})
      region.fetchAccessibilityComparison(centralCoords).should(beGreater)
    })

    it('should have equal accessibility far from the route', () => {
      region.setupAnalysis({project, scenario: 'Single Route'})
      region
        .fetchAccessibilityComparison(farFromRouteCoords)
        .should(([v, c]) => expect(v).to.be.equal(c))
    })

    it('should have different accessibility from a full route modification', () => {
      region.setupAnalysis(
        {
          project,
          scenario: 'Single Route'
        },
        {
          project,
          scenario: 'Segments'
        }
      )
      region.fetchAccessibilityComparison(centralCoords).should(beGreater)
    })

    it('should decrease accessibility with decreased speed', () => {
      singleRouteMod.navTo()
      scaleSpeedBy(0.1)

      region.setupAnalysis({project, scenario: 'Single Route'})
      region.fetchAccessibilityComparison(centralCoords).should(beLess)
    })
  })

  // TODO describe('different results when patterns are deselected', () => {})
})
