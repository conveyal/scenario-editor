// @flow
import {connect} from 'react-redux'
import {goBack, push} from 'react-router-redux'

import {loadBundleGeometries} from '../actions/bundle'
import {addComponent, removeComponent} from '../actions/map'
import {create, deleteScenario, saveToServer} from '../actions/scenario'
import EditScenario from '../components/edit-scenario'
import {BUNDLE_PREVIEW_COMPONENT} from '../constants/map'

import selectProjectId from '../selectors/current-project-id'
import selectScenario from '../selectors/current-scenario'
import selectScenarioId from '../selectors/current-scenario-id'

function mapStateToProps (state, props) {
  const id = selectScenarioId(state, props)
  const currentScenario = selectScenario(state, props) || {}
  const currentBundle = state.scenario.bundlesById[currentScenario.bundleId] || {}
  return {
    bundles: state.scenario.bundles,
    bundleId: currentBundle.id,
    bundleName: currentBundle.name,
    id,
    isEditing: !!id,
    name: currentScenario.name,
    variants: currentScenario.variants,
    projectId: selectProjectId(state, props),
    scenario: currentScenario
  }
}

function mapDispatchToProps (dispatch: Dispatch, props) {
  return {
    close: () => dispatch(goBack()),
    create: (opts) => dispatch(create(opts)),
    deleteScenario: ({scenarioId, projectId}) => dispatch([deleteScenario(scenarioId), push(`/projects/${projectId}`)]),
    fetchAndShowBundle: (bundleId) => dispatch([
      loadBundleGeometries(bundleId),
      addComponent(BUNDLE_PREVIEW_COMPONENT)
    ]),
    goToCreateBundle: () => dispatch(push(`/projects/${props.params.projectId}/bundles/create`)),
    goToEditBundle: (bundleId) => dispatch(push(`/projects/${props.params.projectId}/bundles/${bundleId}/edit`)),
    removeBundlePreview: () => dispatch(removeComponent(BUNDLE_PREVIEW_COMPONENT)),
    save: (opts) => dispatch(saveToServer(opts))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditScenario)
