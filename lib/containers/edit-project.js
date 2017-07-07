import fetch from '@conveyal/woonerf/fetch'
import {connect} from 'react-redux'

import {loadR5Versions} from '../actions'
import {addComponent, removeComponent, setCenter} from '../actions/map'
import {
  create,
  deleteLocally,
  deleteProject,
  load,
  save,
  setLocally
} from '../actions/project'
import EditProject from '../components/edit-project'
import {EDIT_PROJECT_BOUNDS_COMPONENT} from '../constants/map'
import {DEFAULT_BOUNDS} from '../constants/project'

function mapStateToProps ({
  project
}, {
  params
}) {
  const id = params.projectId
  const currentProject = project.projectsById[id] || {}
  return {
    bounds: currentProject.bounds || DEFAULT_BOUNDS,
    description: currentProject.description,
    id,
    isEditing: !!id,
    // not using currentProject defined above, this is only used once the project has been saved,
    // and needs to work even on project creation when currentProject above is {}
    loadStatus: project.currentProject && project.currentProject.loadStatus,
    name: currentProject.name,
    r5Version: currentProject.r5Version || (project.r5Versions ? project.r5Versions.release[0] : null),
    indicators: currentProject.indicators || [],
    allVersions: project.r5Versions ? project.r5Versions.all : [],
    releaseVersions: project.r5Versions ? project.r5Versions.release : []
  }
}

function mapDispatchToProps (dispatch, {
  params
}) {
  return {
    addComponentToMap: () => dispatch(addComponent(EDIT_PROJECT_BOUNDS_COMPONENT)),
    create: (opts) => dispatch(create(opts)),
    clearUncreatedProject: () => dispatch(deleteLocally('undefined')),
    deleteProject: () => dispatch(deleteProject(params.projectId)),
    fetch: (opts) => dispatch(fetch(opts)),
    removeComponentFromMap: () => dispatch(removeComponent(EDIT_PROJECT_BOUNDS_COMPONENT)),
    save: (opts) => dispatch(save(opts)),
    setCenter: (c) => dispatch(setCenter(c)),
    setLocally: (p) => dispatch(setLocally(p)),
    load: (id) => dispatch(load(id)),
    loadR5Versions: () => dispatch(loadR5Versions())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProject)
