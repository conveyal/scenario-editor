import {testComponent} from 'lib/utils/component'
import {mockModification} from 'lib/utils/mock-data'

import Editor from '../editor'

const createProps = (mod) => ({
  allVariants: ['variant one', 'variant two'],
  clearActive: jest.fn(),
  copyModification: jest.fn(),
  feedIsLoaded: true,
  modification: mod,
  modificationId: mod._id,
  query: {
    projectId: mod.projectId,
    regionId: '1'
  },
  removeModification: jest.fn(),
  saveInProgress: false,
  setActive: jest.fn(),
  setMapChildren: jest.fn(),
  setMapState: jest.fn(),
  update: jest.fn(),
  updateAndRetrieveFeedData: jest.fn(),
  updateLocally: jest.fn()
})

describe('Components > Modification > Editor', () => {
  it('should render and execute functions properly', async () => {
    const mod = {...mockModification, description: undefined}
    const props = createProps(mod)
    const wrapper = testComponent(Editor, {...props}).shallow()
    expect(wrapper).toMatchSnapshot()
  })
})
