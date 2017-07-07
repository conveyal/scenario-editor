// @flow
import {createSelector} from 'reselect'

import selectCurrentScenario from './current-scenario'

export default createSelector(
  selectCurrentScenario,
  (_, props) => props.params,
  (currentScenario, routeParams) => currentScenario
    ? currentScenario.projectId
    : routeParams
      ? routeParams.projectId
      : null
)
