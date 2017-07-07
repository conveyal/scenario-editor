import {connect} from 'react-redux'

import {loadR5Versions} from '../actions'
import {load} from '../actions/project'
import Project from '../components/project'
import selectR5Versions from '../selectors/r5-versions'

function mapStateToProps (state, props) {
  return {
    availableR5Versions: selectR5Versions(state, props),
    project: state.project.projectsById[props.params.projectId]
  }
}

export default connect(mapStateToProps, {load, loadR5Versions})(Project)
