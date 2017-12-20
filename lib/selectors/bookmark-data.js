// @flow
import {createSelector} from 'reselect'

import selectCurrentRegionId from './current-region-id'
import OpportunityDatasets from '../modules/opportunity-datasets'

export default createSelector(
  OpportunityDatasets.selectors.selectActiveOpportunityDataset,
  state => state.analysis.profileRequest,
  selectCurrentRegionId,
  (
    opportunityDataset,
    profileRequest,
    regionId
  ) => ({
    opportunityDataset: opportunityDataset && opportunityDataset.key,
    profileRequest,
    regionId
  })
)
