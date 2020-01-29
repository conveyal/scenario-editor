import {testComponent} from 'lib/utils/component'
import {mockTimetable} from 'lib/utils/mock-data'

import Timetable from '../timetable'

describe('Component > Timetable', () => {
  it('renders correctly', () => {
    const removeTimetableFn = jest.fn()
    const replaceTimetableFn = jest.fn()
    const t = testComponent(Timetable, {
      allPhaseFromTimetableStops: {},
      bidirectional: false,
      modificationStops: [],
      numberOfStops: 0,
      timetable: mockTimetable,
      qualifiedStops: [],
      projectTimetables: [],
      segmentDistances: [],
      remove: removeTimetableFn,
      setMapState: jest.fn(),
      update: replaceTimetableFn
    })
    const wrapper = t.mount()

    // not expanded initially
    expect(wrapper).toMatchSnapshot()

    wrapper.find('div.panel-heading').simulate('click')

    // should be expanded now
    expect(wrapper).toMatchSnapshot()

    expect(removeTimetableFn).not.toHaveBeenCalled()
    expect(replaceTimetableFn).not.toHaveBeenCalled()
  })
})
