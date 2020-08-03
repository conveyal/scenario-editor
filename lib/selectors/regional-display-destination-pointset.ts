import get from 'lodash/get'
import {createSelector} from 'reselect'

import {opportunityDatasets} from 'lib/modules/opportunity-datasets/selectors'

import selectActiveRegionalAnalysis from './active-regional-analysis'

/**
 * Get the ID from the query string.
 */
export default createSelector(
  (state) => get(state, 'queryString.destinationPointSetId'),
  selectActiveRegionalAnalysis,
  opportunityDatasets,
  (queryStringId, activeRegionalAnalysis, datasets = []) => {
    const activeId =
      queryStringId ||
      get(activeRegionalAnalysis, 'destinationPointSetIds[0]') ||
      get(activeRegionalAnalysis, 'grid')
    return datasets.find((d) => d._id === activeId)
  }
)
