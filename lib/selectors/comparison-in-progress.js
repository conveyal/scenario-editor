// @flow

/** returns whether there is currently a comparison in progress */

import {createSelector} from 'reselect'

export default createSelector(
  state => state.analysis.comparisonScenarioId,
  state => state.analysis.comparisonVariant,
  (comparisonScenarioId, comparisonVariant) => comparisonScenarioId != null && comparisonVariant != null
)
