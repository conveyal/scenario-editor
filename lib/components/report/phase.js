// @flow

/** display the phasing information for a timetable entry in the report */
import React from 'react'
import DeepEqualComponent from '../deep-equal'
import {sprintf} from 'sprintf-js'

import messages from '../../utils/messages'
import {secondsToHhMmString} from '../../utils/time'

import type {GTFSStop, Timetable} from '../../types'
import {
  toString as timetableToString
} from '../../utils/timetable'

type Props = {
  timetable: Timetable,
  scenarioTimetables: Timetable[],
  feedScopedStops: GTFSStop[]
}

export default class Phase extends DeepEqualComponent<void, Props, void> {
  render () {
    const {timetable, scenarioTimetables, feedScopedStops} = this.props
    const fromTimetable =
      scenarioTimetables.find(candidate =>
        timetable.phaseFromTimetable === `${candidate.modificationId}:${candidate.id}`)

    // stop_name is from GTFS, nothing we can do about camelcase
    /* eslint-disable camelcase */
    const atStop = feedScopedStops.find(({stop_id}) => stop_id === timetable.phaseAtStop)
    const fromStop = feedScopedStops.find(({stop_id}) => stop_id === timetable.phaseFromStop)
    /* eslint-enable camelcase */
    const time = secondsToHhMmString(timetable.phaseSeconds)

    const fromTimetableName = `${fromTimetable.modificationName}: ${timetableToString(fromTimetable)}`

    return <div>
      {sprintf(messages.report.phasing.phaseFromSeconds, { time, timetable: fromTimetableName })}<br />
      {sprintf(messages.report.phasing.phaseAtStop, atStop.stop_name)}<br />
      {sprintf(messages.report.phasing.phaseFromStop, fromStop.stop_name)}
    </div>
  }
}
