import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {login, logout, loadR5Versions} from '../actions'
import {setCenter as setMapCenter} from '../actions/map'
import {loadAll as loadAllProjects} from '../actions/project'
import Application from '../components/application'
import selectActiveModification from '../selectors/active-modification'
import selectBundleId from '../selectors/bundle-id'
import selectModificationBounds from '../selectors/modification-bounds'

function mapStateToProps (state, props) {
  const {mapState, network, project, scenario, user, analysis} = state
  const {params} = props
  const {error, outstandingRequests} = network
  const hasError = !!error
  const {feeds} = scenario
  const currentScenario = scenario.scenariosById[params.scenarioId]
  const currentBundle = currentScenario && currentScenario.bundleId

  return {
    activeModification: selectActiveModification(state, props),
    bundleId: selectBundleId(state, props),
    center: mapState.center,
    error: hasError ? error.error : '',
    errorMessage: hasError ? error.detailMessage : '',
    feeds: state.scenario.feeds,
    hasError,
    hasScenario: !!params.scenarioId,
    mapComponents: mapState.components || [],
    modificationBounds: selectModificationBounds(state, props),
    outstandingRequests,
    project: project.projectsById[params.projectId],
    projects: project.projects,
    projectId: params.projectId,
    scenarioIsLoaded: !!(currentBundle && currentScenario && feeds && feeds.length > 0),
    userIsLoggedIn: !!(user && user.profile && user.idToken),
    username: user.profile && user.profile.name,
    zoom: mapState.zoom,
    analysisMode: analysis.active
  }
}

const mapDispatchToProps = {
  loadAllProjects,
  loadR5Versions,
  login,
  logout,
  push,
  setMapCenter
}

export default connect(mapStateToProps, mapDispatchToProps)(Application)
