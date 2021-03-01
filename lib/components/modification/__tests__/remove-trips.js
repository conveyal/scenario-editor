import {shallowSnapshot, testComponent} from 'lib/utils/component'
import {mockFeed, mockModification, mockPattern} from 'lib/utils/mock-data'

import RemoveTrips from '../remove-trips'

const props = {
  feeds: [mockFeed],
  modification: mockModification,
  routePatterns: [mockPattern],
  selectedFeed: mockFeed,
  update: jest.fn(),
  updateAndRetrieveFeedData: jest.fn()
}

shallowSnapshot(testComponent(RemoveTrips, props))
