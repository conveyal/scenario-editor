import dynamic from 'next/dynamic'
import React from 'react'

import {load} from 'lib/actions/region'
import {
  checkUploadStatus,
  loadOpportunityDatasets,
  setActiveOpportunityDataset
} from 'lib/modules/opportunity-datasets/actions'
import Heading from 'lib/modules/opportunity-datasets/components/heading'
import List from 'lib/modules/opportunity-datasets/components/list'
import MapLayout, {MapChildrenContext} from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const Dotmap = dynamic(
  import('lib/modules/opportunity-datasets/components/dotmap'),
  {ssr: false}
)

const OpportunitiesPage = withInitialFetch(
  function Opportunities(p) {
    // Render into map
    const setMapChildren = React.useContext(MapChildrenContext)
    React.useEffect(() => {
      setMapChildren(() => <Dotmap />)
      return () => setMapChildren(() => <React.Fragment />)
    }, [setMapChildren])

    return (
      <Heading>
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
      dispatch(checkUploadStatus(query.regionId)),
      dispatch(load(query.regionId))
    ])
  }
)

OpportunitiesPage.Layout = MapLayout

export default OpportunitiesPage
