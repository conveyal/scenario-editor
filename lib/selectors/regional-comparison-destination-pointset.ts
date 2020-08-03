import get from 'lodash/get'
import {createSelector} from 'reselect'

import {opportunityDatasets} from 'lib/modules/opportunity-datasets/selectors'

import selectAnalysis from './comparison-regional-analysis'

/**
 * Get the ID from the query string.
 */
export default createSelector(
  (state) => get(state, 'queryString.comparisonDestinationPointSetId'),
  selectAnalysis,
  opportunityDatasets,
  (queryStringId, regionalAnalysis, datasets = []) => {
    const activeId =
      queryStringId ||
      get(regionalAnalysis, 'destinationPointSetIds[0]') ||
      get(regionalAnalysis, 'grid')
    return datasets.find((d) => d._id === activeId)
  }
)
