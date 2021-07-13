import dynamic from 'next/dynamic'
import React from 'react'

import {
  checkUploadStatus,
  loadOpportunityDatasets,
  setActiveOpportunityDataset
} from 'lib/modules/opportunity-datasets/actions'
import Heading from 'lib/modules/opportunity-datasets/components/heading'
import List from 'lib/modules/opportunity-datasets/components/list'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const Dotmap = dynamic(
  import('lib/modules/opportunity-datasets/components/dotmap'),
  {ssr: false}
)

const OpportunitiesPage = withInitialFetch(
  function Opportunities(p) {
    return (
      <Heading>
        <Dotmap />
        <List {...p} regionId={p.query.regionId} />
      </Heading>
    )
  },
  (dispatch, query) => {
    // Set the active id
    dispatch(setActiveOpportunityDataset(query.opportunityDatasetId))

    // Load all the data
    return Promise.all([
      dispatch(loadOpportunityDatasets(query.regionId)),
      dispatch(checkUploadStatus(query.regionId))
    ])
  }
)

OpportunitiesPage.Layout = MapLayout

export default OpportunitiesPage
