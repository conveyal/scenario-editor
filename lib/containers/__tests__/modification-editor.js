import {testComponent} from 'lib/utils/component'

import {mockModification, mockStores} from '../../utils/mock-data'
import ModificationEditor from '../modification-editor'

// Parameters that the Editor would get from the Router
const query = {
  modificationId: mockModification._id,
  projectId: mockModification.projectId,
  regionId: mockModification.regionId
}

describe('Container > Modification Editor', () => {
  it('renders and can change the name', () => {
    // mount component
    const p = testComponent(ModificationEditor, {
      query,
      setMapChildren: jest.fn()
    })
    const wrapper = p.mount()
    wrapper.unmount()
  })

  it('render just the title if not loaded', async () => {
    const init = {...mockStores.init}
    init.project = {...init.project, feeds: [], feedsById: {}}
    const p = testComponent(
      ModificationEditor,
      {query, setMapChildren: jest.fn()},
      init
    )
    const wrapper = p.mount()
    // Should contain "Clear selected bundle" text
    expect(wrapper.find('InnerDock').children()).toMatchSnapshot()
    wrapper.unmount()
  })
})
