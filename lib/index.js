// @flow
import mount from '@conveyal/woonerf/mount'

import reducers from './reducers'
import Routes from './routes'

mount({
  app: Routes,
  reducers
})
