import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import {loadAll as loadAllProjects} from '../actions/project'
import SelectProject from '../components/select-project'
import selectProjects from '../selectors/projects'

function mapStateToProps (state, ownProps) {
  return {
    projects: selectProjects(state, ownProps)
  }
}

export default connect(mapStateToProps, {loadAllProjects, push})(SelectProject)
