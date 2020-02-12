import React from 'react'

import {loadBundles} from 'lib/actions'
import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import withInitialFetch from 'lib/with-initial-fetch'

const BundlesView = p => (
  <Bundles>
    <EditBundle bundleProjects={[]} key={p.bundleId} />
  </Bundles>
)

function initialFetch(store, query) {
  return store.dispatch(loadBundles({regionId: query.regionId}))
}

export default withInitialFetch(BundlesView, initialFetch)
