import React from 'react'

import {loadBundles} from 'lib/actions'
import {loadProjects} from 'lib/actions/project'
import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import withInitialFetch from 'lib/with-initial-fetch'

const BundlesView = p => (
  <Bundles>
    <EditBundle bundleProjects={p.bundleProjects} key={p.query.bundleId} />
  </Bundles>
)

async function initialFetch(store, query) {
  return {
    bundles: await store.dispatch(loadBundles({regionId: query.regionId})),
    bundleProjects: await store.dispatch(
      loadProjects({bundleId: query.bundleId})
    )
  }
}

export default withInitialFetch(BundlesView, initialFetch)
