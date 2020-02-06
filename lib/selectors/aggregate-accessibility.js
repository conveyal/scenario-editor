import {createSelector} from 'reselect'

import {activeOpportunityDatasetGrid} from 'lib/modules/opportunity-datasets/selectors'
import getAggregateAccessibility from 'lib/utils/aggregate-accessibility'

import {active} from './regional-grid'
import selectActiveAggregationArea from './active-aggregation-area'

/**
 * Selector to compute the weighted average accessibility value from a regional
 * analysis
 */
export default createSelector(
  active,
  selectActiveAggregationArea,
  activeOpportunityDatasetGrid,
  getAggregateAccessibility
)
