/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/input', () => { return mockExports(['Group']) })

import SelectFeedAndRoutes from '../../lib/components/select-feed-and-routes'

const feeds = [{ id: 1 }, { id: 2 }]

basicRenderTest({
  component: SelectFeedAndRoutes,
  name: 'SelectFeedAndRoutes',
  notToBeCalledFns: ['onChange'],
  props: {
    feeds: feeds,
    onChange: jest.fn()
  }
})
