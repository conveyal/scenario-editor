/** export a convert-to-frequency modification to r5 */
import {getExactTimesFirstDepartures} from '../timetable'

export default function convertConvertToFrequency (mod) {
  let out = {}
  out.type = 'adjust-frequency'

  out.route = `${mod.feed}:${mod.routes[0]}`

  out.retainTripsOutsideFrequencyEntries = mod.retainTripsOutsideFrequencyEntries

  out.entries = mod.entries.map(({
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    name,
    sourceTrip,
    startTime,
    endTime,
    headwaySecs,
    exactTimes
  }) => {
    let schedule

    // if exactTimes is true, generate scheduled trips
    if (exactTimes) {
      schedule = {
        firstDepartures: getExactTimesFirstDepartures({ headwaySecs, startTime, endTime })
      }
    } else {
      schedule = { headwaySecs, startTime, endTime }
    }

    return {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      name,
      sourceTrip,
      ...schedule
    }
  })

  return out
}
