import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {create as createModification, setAndRetrieveData} from '../actions/modifications'
import Modifications from '../components/modification/list'
import selectActiveModification from '../selectors/active-modification'
import selectBundleId from '../selectors/bundle-id'
import selectProjectId from '../selectors/current-project-id'
import selectScenario from '../selectors/current-scenario'
import selectScenarioId from '../selectors/current-scenario-id'

function mapStateToProps (state, props) {
  const defaultFeedId = state.scenario.feeds.length > 0
    ? state.scenario.feeds[0].id
    : ''

  return {
    activeModification: selectActiveModification(state, props),
    bundleId: selectBundleId(state, props),
    defaultFeedId,
    modifications: state.scenario.modifications || [],
    modificationsByType: state.scenario.modificationsByType || {},
    projectId: selectProjectId(state, props),
    scenario: selectScenario(state, props),
    scenarioId: selectScenarioId(state, props),
    variants: state.scenario.variants
  }
}

function mapDispatchToProps (dispatch) {
  return {
    createModification: (opts) => dispatch(createModification(opts)),
    push: (url) => dispatch(push(url)),
    updateModification: (opts) => dispatch(setAndRetrieveData(opts))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modifications)
