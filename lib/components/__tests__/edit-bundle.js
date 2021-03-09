import {testAndSnapshot} from 'lib/utils/component'
import {mockBundle} from 'lib/utils/mock-data'

import EditBundle from '../edit-bundle'

testAndSnapshot(EditBundle, {
  bundleProjects: [],
  bundles: [mockBundle],
  query: {
    bundleId: mockBundle._id
  }
})
