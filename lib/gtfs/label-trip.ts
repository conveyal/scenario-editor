import {secondsToHhMmString} from 'lib/utils/time'

export default function generateTripLabel(trip: GTFS.Trip): string {
  const name = trip.name ?? trip.headsign ?? ''
  const startTime = secondsToHhMmString(trip.startTime)
  const duration = Math.round(trip.duration / 60)
  return `${name}, starting ${startTime} (${duration} minute trip)`
}
