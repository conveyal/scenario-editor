import {connect} from 'react-redux'

import AddTripPattern from 'lib/components/modification/add-trip-pattern'
import * as select from 'lib/selectors'

function mapStateToProps(state, ownProps) {
  return {
    gtfsStops: select.addTripsGTFSStops(state, ownProps),
    allStops: select.stopsFromAllFeeds(state, ownProps),
    numberOfStops: select.numberOfStops(state, ownProps),
    qualifiedStops: select.qualifiedStopsFromSegments(state, ownProps),
    projectTimetables: select.projectTimetables(state, ownProps),
    segmentDistances: select.segmentDistances(state, ownProps)
  }
}

export default connect(mapStateToProps)(AddTripPattern)
