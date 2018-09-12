// @flow
import {connect} from 'react-redux'

import {AddTripPattern} from '../components/modification/add-trip-pattern'
import * as select from '../selectors'
import type {Modification} from '../types'

function mapStateToProps (
  state: any,
  ownProps: {modification: Modification}
): any {
  return {
    allPhaseFromTimetableStops: select.allPhaseFromTimetableStops(
      state,
      ownProps
    ),
    extendFromEnd: select.extendFromEnd(state, ownProps),
    gtfsStops: select.addTripsGTFSStops(state, ownProps),
    mapState: state.mapState,
    numberOfStops: select.numberOfStops(state, ownProps),
    qualifiedStops: select.qualifiedStopsFromSegments(state, ownProps),
    projectTimetables: select.projectTimetables(state, ownProps),
    segmentDistances: select.segmentDistances(state, ownProps)
  }
}

export default connect(mapStateToProps)(AddTripPattern)
