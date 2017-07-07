/** Container for a report on a scenario */

import {connect} from 'react-redux'
import Report from '../components/report'
import {load as loadScenario} from '../actions/scenario'
import {load as loadProject} from '../actions/project'
import selectFeedScopedStops from '../selectors/feed-scoped-stops'
import selectScenarioTimetables from '../selectors/scenario-timetables'

function mapStateToProps (state, props) {
  const { scenario } = state
  let { scenarioId, projectId, variantId } = props.params
  variantId = parseInt(variantId)
  return {
    modifications: scenario.modifications ? scenario.modifications.filter(m => m.variants[variantId]) : null,
    scenarioId,
    projectId,
    scenario: scenario.currentScenario,
    variant: scenario.variants[variantId],
    bundle: scenario.currentBundle,
    feedsById: scenario.feedsById,
    scenarioTimetables: scenario.modifications && scenario.feedsById ? selectScenarioTimetables(state) : [],
    feedScopedStops: scenario.modifications && scenario.feedsById ? selectFeedScopedStops(state) : []
  }
}

function mapDispatchToProps (dispatch) {
  return {
    loadScenario: (id) => dispatch(loadScenario(id)),
    loadProject: (id) => dispatch(loadProject(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Report)
