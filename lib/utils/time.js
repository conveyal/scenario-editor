
/** Convert seconds since noon - 12h to HH:MM format, discarding fractional components */
export function secondsToHhMmString (secs) {
  // end time may be past midnight, move it back
  secs = secs % (60 * 60 * 24)
  const mins = Math.round(secs / 60)
  const hrs = Math.floor(mins / 60)
  const remainderMins = mins % 60
  return `${hrs < 10 ? '0' + hrs : hrs}:${remainderMins < 10 ? '0' + remainderMins : remainderMins}`
}

export function hhMmStringToSeconds (hhmm) {
  const split = hhmm.split(':')
  return parseInt(split[0]) * 3600 + parseInt(split[1]) * 60
}
