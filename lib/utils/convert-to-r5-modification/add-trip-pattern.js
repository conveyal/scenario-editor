/** convert an add trip pattern modification to r5 format */

import getStops from '../get-stops'
import getHopTimes from '../get-hop-times'

export default function convertAddTripPattern ({
  bidirectional,
  segments,
  timetables
}) {
  const segmentStops = getStops(segments)
  const stops = segmentStops.map((stop) => {
    // already feed scoped
    if (stop.stopId != null) {
      return { id: stop.stopId }
    } else {
      return {
        lat: stop.lat,
        lon: stop.lon
      }
    }
  })

  const frequencies = timetables.map((tt) => {
    const dwellTimes = stops.map((stop) => tt.dwellTime)
    const hopTimes = getHopTimes(segmentStops, tt.speed)
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, startTime, endTime, headwaySecs } = tt
    return { monday, tuesday, wednesday, thursday, friday, saturday, sunday, hopTimes, dwellTimes, startTime, endTime, headwaySecs }
  })

  return {
    bidirectional,
    frequencies,
    stops,
    type: 'add-trips'
  }
}
