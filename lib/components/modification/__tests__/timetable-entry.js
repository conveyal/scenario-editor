import TimetableEntry from '../timetable-entry'
import {testAndSnapshot} from '../../../utils/component'
import {mockTimetable} from '../../../utils/mock-data'

const props = {
  bidirectional: false,
  modificationStops: [],
  projectTimetables: [],
  timetable: mockTimetable,
  update: jest.fn()
}

testAndSnapshot(TimetableEntry, props)
