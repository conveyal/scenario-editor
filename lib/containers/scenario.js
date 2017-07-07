// @flow
import {connect} from 'react-redux'

import {loadBundle} from '../actions'
import {addComponent} from '../actions/map'
import {getForScenario as loadModifications} from '../actions/modifications'
import {load, set} from '../actions/scenario'
import {SINGLE_POINT_ANALYSIS_COMPONENT} from '../constants/map'
import Scenario from '../components/scenario'

import selectBundle from '../selectors/current-bundle'
import selectScenario from '../selectors/current-scenario'
import selectScenarioId from '../selectors/current-scenario-id'

function mapStateToProps (state, props) {
  const scenario = selectScenario(state, props)
  return {
    id: selectScenarioId(state, props),
    bundle: selectBundle(state, props),
    modifications: state.scenario.modifications,
    scenario
  }
}

function mapDispatchToProps (dispatch: Dispatch) {
  return {
    addComponentToMap: () => dispatch(addComponent(SINGLE_POINT_ANALYSIS_COMPONENT)),
    setCurrentScenario: (scenario) => dispatch(set(scenario)),
    load: (id) => dispatch(load(id)),
    loadBundle: (id) => dispatch(loadBundle(id)),
    loadModifications: (opts) => dispatch(loadModifications(opts))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scenario)
