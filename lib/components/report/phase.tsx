import {Stack, Text} from '@chakra-ui/react'

import message from 'lib/message'
import {secondsToHhMmString} from 'lib/utils/time'
import {toString as timetableToString} from 'lib/utils/timetable'
import useAvailablePhaseStops from 'lib/modification/hooks/use-available-phase-stops'
import usePhaseAvailableTimetables from 'lib/modification/hooks/use-phase-timetables'

/**
 * Display the phasing information for a timetable entry in the report
 */
export default function Phase({timetable}: {timetable: CL.AbstractTimetable}) {
  const projectTimetables = usePhaseAvailableTimetables()
  const fromTimetable = projectTimetables.find(
    (candidate) => timetable.phaseFromTimetable === candidate.phaseId
  )
  const feedScopedStops = useAvailablePhaseStops(fromTimetable.phaseId)

  // stop_name is from GTFS, nothing we can do about camelcase
  const atStop = feedScopedStops.find(
    (stop) => stop.scopedId === timetable.phaseAtStop
  )
  const fromStop = feedScopedStops.find(
    (stop) => stop.scopedId === timetable.phaseFromStop
  )
  const time = secondsToHhMmString(timetable.phaseSeconds)

  if (fromTimetable && atStop && fromStop) {
    const fromTimetableName = `${fromTimetable.phaseLabel}: ${timetableToString(
      fromTimetable.timetable
    )}`

    return (
      <Stack spacing={1}>
        <Text>
          {message('report.phasing.phaseFromSeconds', {
            time,
            timetable: fromTimetableName
          })}
        </Text>
        <Text>
          {message('report.phasing.phaseAtStop', {name: atStop.name})}
        </Text>
        <Text>
          {message('report.phasing.phaseFromStop', {name: fromStop.name})}
        </Text>
      </Stack>
    )
  } else {
    return null
  }
}
