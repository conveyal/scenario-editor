// @flow
import {connect} from 'react-redux'
import {goBack, push} from 'react-router-redux'

import {create, deleteProject, saveToServer} from '../actions/project'
import EditProject from '../components/edit-project'
import * as select from '../selectors'

function mapStateToProps (state, props) {
  const _id = select.currentProjectId(state, props)
  const currentProject = select.currentProject(state, props) || {}
  const currentBundle = select.currentBundle(state, props) || {}
  return {
    bundles: select.availableBundles(state, props),
    bundleId: currentBundle._id,
    bundleName: currentBundle.name,
    isEditing: !!_id,
    name: currentProject.name,
    variants: select.variants(state, props),
    regionId: select.currentRegionId(state, props),
    project: currentProject
  }
}

function mapDispatchToProps (dispatch: Dispatch, props) {
  return {
    close: () => dispatch(goBack()),
    create: opts => dispatch(create(opts)),
    deleteProject: ({projectId, regionId}) =>
      dispatch([deleteProject(projectId), push(`/regions/${regionId}`)]),
    goToCreateBundle: regionId =>
      dispatch(push(`/regions/${regionId}/bundles/create`)),
    save: opts => dispatch(saveToServer(opts))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProject)
