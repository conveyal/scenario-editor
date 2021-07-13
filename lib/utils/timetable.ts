import {v4 as uuidv4} from 'uuid'

import {secondsToHhMmString} from './time'

export function create(
  segmentSpeeds: CL.SegmentSpeeds = [],
  count = 0
): CL.Timetable {
  const timetable = {
    _id: uuidv4(),
    startTime: 7 * 3600,
    endTime: 22 * 3600,
    dwellTime: 0,
    dwellTimes: [],
    segmentSpeeds,
    headwaySecs: 600,
    exactTimes: false,

    // active every day
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,

    name: `Timetable ${count + 1}`
  }

  return timetable
}

/** Get the first departures for a given timetable that is represented as exact times */
export function getExactTimesFirstDepartures({
  headwaySecs,
  startTime,
  endTime
}) {
  const firstDepartures = [startTime]
  let departure = startTime
  // note that interval is [startTime, endTime), to match GTFS
  // https://groups.google.com/forum/#!topic/gtfs-changes/5u8yXBrpK2w
  while ((departure += headwaySecs) < endTime) {
    firstDepartures.push(departure)
  }
  return firstDepartures
}

export function toString(timetable: CL.AbstractTimetable) {
  const startTime = secondsToHhMmString(timetable.startTime)
  const endTime = secondsToHhMmString(timetable.endTime)
  const headway = secondsToHhMmString(timetable.headwaySecs)
  return `${timetable.name} ${startTime} to ${endTime} every ${headway}`
}
