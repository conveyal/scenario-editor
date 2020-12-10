import {testAndSnapshot} from 'lib/utils/component'
import {mockProject} from 'lib/utils/mock-data'

import ModificationsList from '../list'

testAndSnapshot(ModificationsList, {
  bundle: {feeds: []},
  project: mockProject
})
