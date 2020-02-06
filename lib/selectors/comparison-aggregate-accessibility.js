import {createSelector} from 'reselect'

import {activeOpportunityDatasetGrid} from 'lib/modules/opportunity-datasets/selectors'
import getAggregateAccessibility from 'lib/utils/aggregate-accessibility'

import {comparison} from './regional-grid'
import selectActiveAggregationArea from './active-aggregation-area'

/** Aggregate accessibility for the comparison regional analysis */
export default createSelector(
  comparison,
  // aggregation area and weights don't vary between base and comparison
  selectActiveAggregationArea,
  activeOpportunityDatasetGrid,
  getAggregateAccessibility
)
