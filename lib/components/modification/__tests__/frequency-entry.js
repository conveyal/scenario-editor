/* global describe, it, expect, jest */

describe('Component > FrequencyEntry', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const {mockFeed, mockTimetable} = require('../../../utils/mock-data')
  const FrequencyEntry = require('../frequency-entry')

  it('renders correctly', () => {
    const replaceTimetableFn = jest.fn()
    const removeTimetableFn = jest.fn()
    const setActiveTripsFn = jest.fn()
    const tree = renderer.create(
      <FrequencyEntry
        feed={mockFeed}
        update={replaceTimetableFn}
        remove={removeTimetableFn}
        setActiveTrips={setActiveTripsFn}
        timetable={mockTimetable}
        routes={['route1']}
        trip='abcd'
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceTimetableFn).not.toBeCalled()
    expect(removeTimetableFn).not.toBeCalled()
    expect(setActiveTripsFn).not.toBeCalled()
  })
})
