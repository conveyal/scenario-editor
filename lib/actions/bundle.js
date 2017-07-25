// @flow
import fetch from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'

import {allBundleGeometries, compose} from '../graphql/query'

const setBundleGeometries = createAction('set bundle geometries')

export function loadBundleGeometries (bundleId: string) {
  return fetch({
    url: compose(allBundleGeometries, {bundleId}),
    next (err, response) {
      if (!err) {
        return setBundleGeometries(response.value.bundle[0])
      }
    }
  })
}
