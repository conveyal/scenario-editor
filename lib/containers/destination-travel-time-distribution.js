// @flow

import {connect} from 'react-redux'
import DestinationTravelTimeDistribution from '../components/map/destination-travel-time-distribution'
import {setDestination} from '../actions/analysis'
import {removeComponent} from '../actions/map'
import {DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT} from '../constants/map'
import selectDestinationTravelTimeDistribution from '../selectors/destination-travel-time-distribution'
import selectComparisonDestinationTravelTimeDistribution from '../selectors/comparison-destination-travel-time-distribution'

import type {LonLat, Quintiles} from '../types'

function mapStateToProps (state: any): {
  destination: LonLat,
  isFetchingIsochrone: boolean,
  destinationTravelTimeDistribution: Quintiles
} {
  const {destination, isFetchingIsochrone} = state.analysis

  return {
    destination,
    isFetchingIsochrone,
    destinationTravelTimeDistribution: selectDestinationTravelTimeDistribution(state),
    comparisonDestinationTravelTimeDistribution: selectComparisonDestinationTravelTimeDistribution(state)
  }
}

function mapDispatchToProps (dispatch: (any) => void): any {
  return {
    remove: () => dispatch(removeComponent(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT)),
    setDestination: (destination) => dispatch(setDestination(destination))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DestinationTravelTimeDistribution)
