import React from 'react'

import {loadBundles} from 'lib/actions'
import {loadProjects} from 'lib/actions/project'
import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const BundleViewPage = withInitialFetch(
  (p) => (
    <Bundles regionId={p.query.regionId}>
      <EditBundle bundleProjects={p.bundleProjects} key={p.query.bundleId} />
    </Bundles>
  ),
  async (dispatch, query) => ({
    bundles: await dispatch(loadBundles({regionId: query.regionId})),
    bundleProjects: await dispatch(loadProjects({bundleId: query.bundleId}))
  })
)

BundleViewPage.Layout = MapLayout

export default BundleViewPage
