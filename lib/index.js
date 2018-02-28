// @flow
import mount from '@conveyal/woonerf/mount'
import memoize from 'lodash/memoize'

import reducers from './reducers'
import Routes from './routes'

// Set the cache to a WeakMap to allow garbage collection on unused values
memoize.Cache = WeakMap

mount({
  app: Routes,
  reducers
})
