/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

import SelectStops from '../../lib/components/select-stops'

basicRenderTest({
  component: SelectStops,
  name: 'SelectStops',
  notToBeCalledFns: ['replaceModification', 'setMapState'],
  props: {
    modification: {},
    replaceModification: jest.fn(),
    setMapState: jest.fn()
  }
})
