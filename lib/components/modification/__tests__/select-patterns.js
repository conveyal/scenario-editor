import {mockPattern} from 'lib/utils/mock-data'
import {testAndSnapshot} from 'lib/utils/component'

import SelectPatterns from '../select-patterns'

testAndSnapshot(SelectPatterns, {
  onChange: jest.fn(),
  routePatterns: [mockPattern],
  trips: null
})
