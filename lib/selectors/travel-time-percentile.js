import get from 'lodash/get'

export default function selectTravelTimePercentile(s) {
  return get(s, 'analysis.travelTimePercentile', 50)
}
