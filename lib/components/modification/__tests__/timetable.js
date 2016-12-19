/* global describe, it, expect, jest */

describe('Component > Timetable', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const {mockTimetable} = require('../../../utils/mock-data')
  const Timetable = require('../timetable')

  it('renders correctly', () => {
    const removeTimetableFn = jest.fn()
    const replaceTimetableFn = jest.fn()
    const tree = renderer.create(
      <Timetable
        timetable={mockTimetable}
        travelTime={0}
        remove={removeTimetableFn}
        segments={[]}
        update={replaceTimetableFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(removeTimetableFn).not.toBeCalled()
    expect(replaceTimetableFn).not.toBeCalled()
  })
})
