import enzyme from 'enzyme'
import React from 'react'

import {mockProfileRequest} from 'lib/utils/mock-data'

import ProfileRequestEditor from '../profile-request-editor'

describe('Components > Analysis > Profile Request Editor', () => {
  it('should render correctly', () => {
    const wrapper = enzyme.mount(
      <ProfileRequestEditor
        disabled={false}
        profileRequest={mockProfileRequest}
      />
    )

    wrapper.unmount()
  })
})
