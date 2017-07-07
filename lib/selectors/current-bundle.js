// @flow
import {createSelector} from 'reselect'

import selectCurrentScenario from './current-scenario'

export default createSelector(
  selectCurrentScenario,
  (state) => state.scenario.bundlesById,
  (state) => state.scenario.currentBundle,
  (scenario, bundlesById, currentBundle) => scenario
    ? bundlesById[scenario.bundleId]
    : currentBundle
)
