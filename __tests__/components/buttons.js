import { basicRenderTest } from '../../testUtils/unitUtils'

import { Group, Button } from '../../lib/components/buttons'

basicRenderTest([
  {
    component: Button,
    name: 'Button',
    props: {
      style: 'fabulous',
      block: true,
      size: 'sm',
      className: 'some-class',
      target: '_blank'
    }
  }, {
    component: Group,
    name: 'Group',
    props: {
      justified: true
    }
  }
])
