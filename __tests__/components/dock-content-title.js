import { basicRenderTest } from '../../testUtils/unitUtils'

import Title from '../../lib/components/dock-content-title'

basicRenderTest({
  children: 'Title text',
  component: Title,
  name: 'Title'
})
