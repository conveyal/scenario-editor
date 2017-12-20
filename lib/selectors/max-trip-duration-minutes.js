// @flow
import get from '../utils/get'

export default function (state: any) {
  return get(state, 'analysis.profileRequest.maxTripDurationMinutes', 60)
}
