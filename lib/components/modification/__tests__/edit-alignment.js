import {testAndSnapshot} from 'lib/utils/component'
import {mockModification} from 'lib/utils/mock-data'
import EditAlignment from '../edit-alignment'

const props = {
  disabled: false,
  extendFromEnd: false,
  mapState: {
    modificationId: mockModification._id,
    state: null
  },
  modification: mockModification,
  allStops: [],
  numberOfStops: 16,
  segmentDistances: [45.22],
  update: jest.fn()
}

testAndSnapshot(EditAlignment, props)
