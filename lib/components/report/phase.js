import {Stack, Text} from '@chakra-ui/react'
import React from 'react'

import message from 'lib/message'
import {secondsToHhMmString} from 'lib/utils/time'
import {toString as timetableToString} from 'lib/utils/timetable'

/**
 * Display the phasing information for a timetable entry in the report
 */
export default function Phase(p) {
  const {timetable, projectTimetables, feedScopedStops} = p
  const fromTimetable = projectTimetables.find(
    (candidate) =>
      timetable.phaseFromTimetable ===
      `${candidate.modificationId}:${candidate._id}`
  )

  // stop_name is from GTFS, nothing we can do about camelcase
  const atStop = feedScopedStops.find(
    (stop) => stop.stop_id === timetable.phaseAtStop
  )
  const fromStop = feedScopedStops.find(
    (stop) => stop.stop_id === timetable.phaseFromStop
  )
  const time = secondsToHhMmString(timetable.phaseSeconds)

  if (fromTimetable && atStop && fromStop) {
    const fromTimetableName = `${
      fromTimetable.modificationName
    }: ${timetableToString(fromTimetable)}`

    return (
      <Stack spacing={1}>
        <Text>
          {message('report.phasing.phaseFromSeconds', {
            time,
            timetable: fromTimetableName
          })}
        </Text>
        <Text>
          {message('report.phasing.phaseAtStop', {name: atStop.stop_name})}
        </Text>
        <Text>
          {message('report.phasing.phaseFromStop', {name: fromStop.stop_name})}
        </Text>
      </Stack>
    )
  } else {
    return null
  }
}
