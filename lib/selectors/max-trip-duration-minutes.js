import get from 'lodash/get'

export default function selectMaxTripDurationMinutes(s) {
  return get(s, 'analysis.maxTripDurationMinutes', 60)
}
