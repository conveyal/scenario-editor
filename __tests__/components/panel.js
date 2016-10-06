import { basicRenderTest } from '../../testUtils/unitUtils'

const panelComps = require('../../lib/components/panel')

basicRenderTest(Object.keys(panelComps).map((comp) => {
  return {
    children: `${comp} text`,
    component: panelComps[comp],
    name: comp
  }
}))
