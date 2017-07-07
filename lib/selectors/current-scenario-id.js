// @flow
import {createSelector} from 'reselect'

import selectActiveModification from './active-modification'

export default createSelector(
  selectActiveModification,
  (state) => state.scenario.currentScenario,
  (_, props) => props.params,
  (activeModification, currentScenario, routeParams) => activeModification
    ? activeModification.scenario
    : currentScenario
      ? currentScenario.id
      : routeParams && routeParams.scenarioId
)
