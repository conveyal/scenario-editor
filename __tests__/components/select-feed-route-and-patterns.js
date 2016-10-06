/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/select-patterns', () => 'SelectPatterns')
jest.mock('../../lib/components/select-feed-and-routes', () => 'SelectFeedAndRoutes')

import SelectFeedRouteAndPatterns from '../../lib/components/select-feed-route-and-patterns'

basicRenderTest({
  component: SelectFeedRouteAndPatterns,
  name: 'SelectFeedRouteAndPatterns',
  notToBeCalledFns: ['onChange'],
  props: {
    feeds: [],
    onChange: jest.fn(),
    routes: []
  }
})
