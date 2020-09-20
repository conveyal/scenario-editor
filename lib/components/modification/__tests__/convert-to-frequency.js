import {shallowSnapshot, wrapMapComponent} from 'lib/utils/component'
import {
  mockFeed,
  mockModification,
  mockPattern,
  mockStop1
} from 'lib/utils/mock-data'

import ConvertToFrequency from '../convert-to-frequency'

shallowSnapshot(
  wrapMapComponent(ConvertToFrequency, {
    allPhaseFromTimetableStops: {},
    feeds: [mockFeed],
    feedScopedModificationStops: [mockStop1],
    modification: mockModification,
    projectTimetables: [],
    routePatterns: [mockPattern],
    selectedFeed: mockFeed,

    // actions
    setActiveTrips: jest.fn(),
    update: jest.fn(),
    updateAndRetrieveFeedData: jest.fn()
  })
)
