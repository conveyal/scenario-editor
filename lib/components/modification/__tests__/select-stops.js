import {testAndSnapshot} from 'lib/utils/component'
import {mockModification} from 'lib/utils/mock-data'

import SelectStops from '../select-stops'

testAndSnapshot(SelectStops, {
  modification: mockModification
})
