// @flow
import {createSelector} from 'reselect'

import {activeOpportunityDataset} from '../modules/opportunity-datasets/selectors'

import selectCurrentRegionId from './current-region-id'

export default createSelector(
  activeOpportunityDataset,
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
