import {testAndSnapshot} from 'lib/utils/component'
import {mockFeed, mockModification} from 'lib/utils/mock-data'

import AdjustSpeed from '../adjust-speed'

testAndSnapshot(AdjustSpeed, {
  feeds: [mockFeed],
  modification: mockModification,
  routePatterns: [],
  selectedFeed: undefined,
  update: jest.fn(),
  updateAndRetrieveFeedData: jest.fn()
})
