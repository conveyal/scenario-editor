import {connect} from 'react-redux'

import fetch from 'lib/actions/fetch'
import {API} from 'lib/constants'

import CopyTimetableModal from 'lib/components/modification/copy-timetable'
import * as select from 'lib/selectors'

function mapStateToProps(state, ownProps) {
  return {
    currentModification: select.activeModification(state, ownProps),
    currentProject: select.currentProject(state, ownProps),
    regionId: select.currentRegionId(state, ownProps)
  }
}

const getTimetables = () => fetch({url: API.Timetables})

export default connect(mapStateToProps, {getTimetables})(CopyTimetableModal)
