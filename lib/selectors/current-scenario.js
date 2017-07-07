// @flow
import {createSelector} from 'reselect'

import selectCurrentScenarioId from './current-scenario-id'

export default createSelector(
  selectCurrentScenarioId,
  (state) => state.scenario.scenariosById,
  (id, scenariosById) => scenariosById[id]
)
