import {getRegion, scratchRegion} from './utils'

/**
 * EXAMPLE TEST
 *
 * This test is an example of how to setup a modification and run an
 * accessibility calculation comparing the results of the new scenario to the
 * baseline against the default opportunity data.
 */
describe('Example Modification Test', () => {
  // Create a new region
  const newRegion = getRegion('Example', scratchRegion.bounds)

  // Create a new bundle
  const newBundle = newRegion.getBundle(
    'Example Bundle',
    'regions/nky/TANK-GTFS.zip', // path from fixtures folder
    'regions/nky/streets.osm.pbf'
  )

  // Create a new opportunity dataset
  const opportunityData = newRegion.getOpportunityDataset(
    'Example OD',
    'regions/nky/people.grid'
  )

  // Or use the default region. Which comes with the above default bundle and opportunity data and a default project.
  // const region = getDefaultRegion()

  // Creates a new project for this test group. Uses the first bundle if none is provided.
  const project = newRegion.getProject('Example Modification Test', newBundle)

  // Create scenarios to be used.
  project.getScenarios(['Example Scenario 1', 'Example Scenario 2'])

  // Creates a modification if it does not exist.
  const persistentMod = project.getModification({
    type: 'Adjust Speed',
    data: {
      // Will be set on each test run. Not just on creation.
      scale: 10,
      variants: [true, false, true] // corresponds to the above
    }
  })

  // This modification is will get deleted in the test
  const modDeletedInTest = project.getModification({
    type: 'Add Streets',
    // Usually names are auto-incremented. In development tests may be
    // skipped and run out of order. Set a name manually to ensure stability.
    name: 'UUID',
    onCreate: () => {
      // Setup the modification. Only run on initial creation.
    }
  })

  it('should have equal accessibility with no changes', () => {
    // Helper to open modification
    persistentMod.navTo()

    // Delete modification with helper. Does not need to be open
    modDeletedInTest.delete()

    // Runs a single point comparison at the coords and returns the two accessibility results
    newRegion.setupAnalysis({project})

    // Fetch with a location and an opportunity dataset (optional)
    newRegion
      .fetchAccessibilityComparison(
        scratchRegion.locations.center as L.LatLngTuple,
        opportunityData
      )
      .should(([a, c]) => expect(a).to.be.greaterThan(c))
  })
})
