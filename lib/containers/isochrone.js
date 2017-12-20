// @flow
import {connect} from 'react-redux'

import {
  fetchTravelTimeSurface,
  setDestination,
  setProfileRequest
} from '../actions/analysis'
import {addComponent, removeComponent} from '../actions/map'
import Isochrone from '../components/map/isochrone'
import {
  ISOCHRONE_COMPONENT,
  DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT
} from '../constants/map'
import selectIsochrone from '../selectors/isochrone'
import selectComparisonIsochrone from '../selectors/comparison-isochrone'
import selectComparisonInProgress from '../selectors/comparison-in-progress'
import selectMaxTripDurationMinutes from '../selectors/max-trip-duration-minutes'
import selectProfileRequestHasChanged from '../selectors/profile-request-has-changed'

function mapStateToProps (state, props) {
  const pr = state.analysis.profileRequest

  return {
    comparisonIsochrone: selectComparisonIsochrone(state),
    comparisonInProgress: selectComparisonInProgress(state),
    isochrone: selectIsochrone(state),
    isochroneCutoff: selectMaxTripDurationMinutes(state, props),
    isochroneLonLat: pr.fromLat && pr.fromLon ? {lon: pr.fromLon, lat: pr.fromLat} : null,
    isochroneIsStale: selectProfileRequestHasChanged(state, props),

    isDestinationTravelTimeDistributionComponentOnMap: state.mapState.components.includes(
      DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT
    )
  }
}

function mapDispatchToProps (dispatch: Dispatch, props) {
  return {
    setIsochroneLonLat: lonlat => {
      dispatch(setProfileRequest({fromLat: lonlat.lat, fromLon: lonlat.lon}))
      dispatch(fetchTravelTimeSurface())
    },
    remove: () => dispatch(removeComponent(ISOCHRONE_COMPONENT)),
    addDestinationTravelTimeDistributionComponentToMap: () =>
      dispatch(addComponent(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT)),
    removeDestinationTravelTimeDistributionComponentFromMap: () =>
      dispatch(removeComponent(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT)),
    setDestination: destination => dispatch(setDestination(destination))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Isochrone)
