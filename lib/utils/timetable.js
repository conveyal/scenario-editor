
export function create (segmentSpeeds = []) {
  const timetable = {
    startTime: 7 * 3600,
    endTime: 22 * 3600,
    dwellTime: 0,
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
    sunday: true
  }

  return timetable
}

/** Get the first departures for a given timetable that is represented as exact times */
export function getExactTimesFirstDepartures ({ headwaySecs, startTime, endTime }) {
  const firstDepartures = [startTime]
  let departure = startTime
  // note that interval is [startTime, endTime), to match GTFS
  // https://groups.google.com/forum/#!topic/gtfs-changes/5u8yXBrpK2w
  while ((departure += headwaySecs) < endTime) firstDepartures.push(departure)
  return firstDepartures
}
