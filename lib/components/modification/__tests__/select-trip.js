/* global describe, it, expect, jest */

describe('Component > SelectTrip', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const {mockFeed} = require('../../../utils/mock-data')
  const SelectTrip = require('../select-trip')

  it('renders correctly', () => {
    const patternTrips = ['abcd']
    const onChangeFn = jest.fn()
    const routes = ['route1']
    const trip = 'abcd'
    const tree = renderer.create(
      <SelectTrip
        feed={mockFeed}
        onChange={onChangeFn}
        patternTrips={patternTrips}
        routes={routes}
        trip={trip}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
