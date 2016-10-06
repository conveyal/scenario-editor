import { basicRenderTest } from '../../testUtils/unitUtils'

import Icon from '../../lib/components/icon'

basicRenderTest({
  component: Icon,
  name: 'Icon',
  props: {
    type: 'pencil',
    className: 'test'
  }
})
