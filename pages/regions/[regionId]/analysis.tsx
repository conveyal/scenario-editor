import dynamic from 'next/dynamic'

import {loadRequestsSettings} from 'lib/actions/analysis/profile-request'
import {
  setScenarioApplicationErrors,
  setScenarioApplicationWarnings
} from 'lib/actions/analysis'
import MapLayout from 'lib/layouts/map'
import {setActiveOpportunityDataset} from 'lib/modules/opportunity-datasets/actions'
import withInitialFetch from 'lib/with-initial-fetch'

// Loads many map components
const SinglePointAnalysis = dynamic(() => import('lib/components/analysis'), {
  ssr: false
})

const AnalysisPage: any = withInitialFetch(
  SinglePointAnalysis,
  async (dispatch, query) => {
    // Set the active id
    dispatch(setActiveOpportunityDataset(query.opportunityDatasetId))
    dispatch(setScenarioApplicationWarnings(null))
    dispatch(setScenarioApplicationErrors(null))
    dispatch(loadRequestsSettings(query.regionId))

    return {}
  }
)

AnalysisPage.Layout = MapLayout

export default AnalysisPage
