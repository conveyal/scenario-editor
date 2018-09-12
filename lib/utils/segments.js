/** Functions to manipulate the segments object present in reroute and add trips */

import sum from 'lodash/sum'

import {DEFAULT_SEGMENT_SPEED} from '../constants/timetables'

/**
 * Get the average travel speed given speeds of the segments.
 * Output units are the same as input units of speed, e.g. if segmentSpeeds is kmph, output will be
 * kmph.
 */
export function getAverageSpeedOfSegments ({segmentDistances, segmentSpeeds}) {
  const totalDistance = sum(segmentDistances)
  const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
  return (
    weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance
  )
}

/**
 * Get the travel time in minutes given dwell times in seconds, segment distances in km, and speeds
 * in kph.
 */
export function getTravelTimeMinutes ({
  dwellTime, // seconds
  numberOfStops,
  segmentDistances, // km
  segmentSpeeds // kph
}) {
  if (numberOfStops > 0) {
    const segmentTimes = segmentDistances.map(
      (segmentDistance, i) =>
        segmentDistance / (segmentSpeeds[i] || DEFAULT_SEGMENT_SPEED)
    )
    const totalMovingTime = sum(segmentTimes) * 60

    // add the dwell times
    const dwellMinutes = dwellTime / 60
    const dwellingTime = numberOfStops * dwellMinutes
    return totalMovingTime + dwellingTime
  } else {
    return 0
  }
}
