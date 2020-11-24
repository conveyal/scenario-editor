import {shallowSnapshot, wrapMapComponent} from 'lib/utils/component'
import {
  mockFeed,
  mockModification,
  mockSegment,
  mockGtfsStops
} from 'lib/utils/mock-data'
import TransitEditor from '../'

jest.mock('leaflet')

mockFeed.stops = mockGtfsStops
mockModification.segments = [mockSegment]

const props: Parameters<typeof TransitEditor>[0] = {
  allowExtend: true,
  allStops: mockGtfsStops,
  extendFromEnd: true,
  followRoad: true,
  modification: mockModification as CL.AddTripPattern,
  spacing: 0,
  updateModification: jest.fn()
}

shallowSnapshot(wrapMapComponent(TransitEditor, props))
