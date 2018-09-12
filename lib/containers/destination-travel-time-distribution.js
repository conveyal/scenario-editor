// @flow
import {connect} from 'react-redux'

import DestinationTravelTimeDistribution
  from '../components/map/destination-travel-time-distribution'
import {setDestination} from '../actions/analysis'
import * as select from '../selectors'

function mapStateToProps (state: any) {
  const {destination, isFetchingIsochrone} = state.analysis

  return {
    destination,
    isFetchingIsochrone,
    distribution: select.destinationTravelTimeDistribution(state),
    comparisonDistribution: select.comparisonDestinationTravelTimeDistribution(
      state
    )
  }
}

function mapDispatchToProps (dispatch: any => void): any {
  return {
    setDestination: destination => dispatch(setDestination(destination))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DestinationTravelTimeDistribution
)
