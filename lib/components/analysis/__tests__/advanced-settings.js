import {testComponent} from 'lib/utils/component'

import {
  mockProfileRequest,
  mockRegion,
  mockRegionalAnalyses
} from 'lib/utils/mock-data'

import AdvancedSettings from '../advanced-settings'

describe('Components > Analysis > Advanced Settings', () => {
  const props = {
    disabled: false,
    profileRequest: mockProfileRequest,
    regionalAnalyses: mockRegionalAnalyses,
    regionBounds: mockRegion.bounds
  }
  it('should render correctly', () => {
    const tree = testComponent(AdvancedSettings, {...props})
    const mounted = tree.mount()
    mounted.unmount()
  })
})
