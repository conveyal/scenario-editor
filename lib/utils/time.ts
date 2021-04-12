const pad0 = (t: number): string => String(t).padStart(2, '0')

/** Convert seconds since noon - 12h to HH:MM format, discarding fractional components */
export function secondsToHhMmString(secs: number, padHours = true): string {
  // end time may be past midnight, move it back
  secs = secs % (60 * 60 * 24)
  const mins = Math.round(secs / 60)
  const hrs = Math.floor(mins / 60)
  const remainderMins = mins % 60
  if (padHours) return `${pad0(hrs)}:${pad0(remainderMins)}`
  else return `${hrs}:${pad0(remainderMins)}`
}

export function secondsToHhMmSsString(secs: number): string {
  const hrs = Math.floor(secs / 60 / 60)
  const mins = Math.floor((secs / 60) % 60)
  return `${pad0(hrs)}:${pad0(mins)}:${pad0(secs % 60)}`
}

export function hhMmStringToSeconds(hhmm: string): number {
  return hhmm
    .split(':')
    .map((_) => parseInt(0 + _))
    .reduce((hours, minutes) => hours * 3600 + minutes * 60)
}

export function secondsToMmSsString(secs: number): string {
  return `${pad0(Math.floor(secs / 60))}:${pad0(Math.floor(secs % 60))}`
}

export function mmSsStringToSeconds(mmss: string): number {
  return mmss
    .split(':')
    .map((_) => parseInt(0 + _))
    .reduce((minutes, seconds) => minutes * 60 + seconds)
}
