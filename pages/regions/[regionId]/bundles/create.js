import React from 'react'

import {loadBundles} from 'lib/actions'
import {loadRegion} from 'lib/actions/region'
import CreateBundle from 'lib/components/create-bundle'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const CreateBundlePage = withInitialFetch(
  (p) => <CreateBundle regionId={p.query.regionId} />,
  (dispatch, query) =>
    Promise.all([
      dispatch(loadBundles({regionId: query.regionId})),
      dispatch(loadRegion(query.regionId))
    ])
)

CreateBundlePage.Layout = MapLayout

export default CreateBundlePage
