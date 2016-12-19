/* global describe, it, expect, jest */

describe('Component > TimetableEntry', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const {mockTimetable} = require('../../../utils/mock-data')
  const TimetableEntry = require('../timetable-entry')

  it('renders correctly', () => {
    const update = jest.fn()
    const tree = renderer.create(
      <TimetableEntry
        timetable={mockTimetable}
        update={update}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(update).not.toBeCalled()
  })
})
