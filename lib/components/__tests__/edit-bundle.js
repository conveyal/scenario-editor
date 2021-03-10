import {testAndSnapshot} from 'lib/utils/component'
import {mockBundle} from 'lib/utils/mock-data'

import EditBundle from '../edit-bundle'

testAndSnapshot(EditBundle, {
  bundleProjects: [],
  bundle: mockBundle,
  query: {
    regionId: mockBundle.regionId
  }
})
