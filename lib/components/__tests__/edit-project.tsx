import {testAndSnapshot} from 'lib/utils/component'

import EditProject from '../edit-project'

testAndSnapshot(EditProject, {
  query: {
    projectId: '1',
    regionId: '1'
  }
})
