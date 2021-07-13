import {v4 as uuidv4} from 'uuid'

export function create(count: number): CL.FrequencyEntry {
  return {
    _id: uuidv4(),
    name: `Frequency Entry ${count}`,
    sourceTrip: null,
    headwaySecs: 600,
    patternTrips: [],
    startTime: 7 * 3600,
    endTime: 22 * 3600,
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
}
