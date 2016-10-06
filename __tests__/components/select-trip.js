/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/input', () => { return mockExports(['Group']) })

import SelectTrip from '../../lib/components/select-trip'

const patternTrips = ['abcd']
const mockFeed = {
  routesById: {
    route1: {
      patterns: [
        {
          trips: [
            {
              trip_id: 'abcd',
              start_time: 12345,
              trip_short_name: 'The Express',
              trip_headsign: 'To Downtown',
              duration: 1234
            }
          ]
        }
      ]
    }
  }
}
const routes = ['route1']
const trip = 'abcd'

basicRenderTest({
  component: SelectTrip,
  name: 'SelectTrip',
  notToBeCalledFns: ['onChange'],
  props: {
    feed: mockFeed,
    onChange: jest.fn(),
    patternTrips: patternTrips,
    routes: routes,
    trip: trip
  }
})
