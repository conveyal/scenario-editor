import React from 'react'

import {loadBundles} from 'lib/actions'
import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const BundlesPage = withInitialFetch(
  (p) => (
    <Bundles regionId={p.query.regionId}>
      <EditBundle bundleProjects={[]} key={p.query.bundleId} />
    </Bundles>
  ),
  async (dispatch, query) => {
    return {
      bundles: await dispatch(loadBundles({regionId: query.regionId}))
    }
  }
)

BundlesPage.Layout = MapLayout

export default BundlesPage
