import {createSelector} from 'reselect'

import nearestPercentileIndex from './nearest-percentile-index'
import selectTravelTimePercentile from './travel-time-percentile'

export default createSelector(selectTravelTimePercentile, (ttp) =>
  nearestPercentileIndex(ttp)
)
