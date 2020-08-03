import {testAndSnapshot} from 'lib/utils/component'
import {mockProfileRequest} from 'lib/utils/mock-data'

import ProfileRequestDisplay from '../profile-request-display'

testAndSnapshot(ProfileRequestDisplay, {
  ...mockProfileRequest,
  profileRequest: mockProfileRequest
})
