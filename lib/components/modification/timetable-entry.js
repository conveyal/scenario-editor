// @flow
import assert from 'assert'

import React, {PureComponent} from 'react'

import {Checkbox} from '../input'
import MinutesSeconds from '../minutes-seconds'
import TimePicker from '../time-picker'
import messages from '../../utils/messages'
import type {GTFSStop, Timetable} from '../../types'

import Phase from './phase'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]
const DAYS_LOWER_CASE = DAYS.map(d => d.toLowerCase())

type Props = {
  allPhaseFromTimetableStops: {
    [timetableId: string]: GTFSStop[]
  },
  bidirectional: boolean,
  modificationStops: GTFSStop[],
  projectTimetables: Timetable[],
  timetable: Timetable,
  update(any): void
}

type State = {
  availableTimetables: Timetable[]
}

/**
 * Superclass for both changing frequencies and creating patterntimetables for
 * new patterns
 */
export default class TimetableEntry extends PureComponent<Props, State> {
  state = {
    availableTimetables: getAvailableTimetables(this.props)
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.projectTimetables !== this.props.projectTimetables) {
      this.setState({
        availableTimetables: getAvailableTimetables(nextProps)
      })
    }
  }

  /** set a particular day of the week as having or not having service */
  setDay = (day: string, value: boolean) => {
    assert(
      DAYS_LOWER_CASE.indexOf(day) !== -1,
      `${day} is not a day of the week`
    )
    const {update} = this.props
    update({[day]: value})
  }

  /** set the headway of the modification */
  setHeadway = (headwaySecs: number) => {
    this.props.update({headwaySecs})
  }

  /** set the start time of this modification */
  setStartTime = (time: number) => {
    const startTime = modBy24hours(time)
    const {timetable, update} = this.props
    update({
      startTime,
      endTime: add24hoursToEndIfLessThanStart(startTime, timetable.endTime)
    })
  }

  /** set the end time of this modification */
  setEndTime = (time: number) => {
    const endTime = modBy24hours(time)
    const {timetable, update} = this.props
    update({
      endTime: add24hoursToEndIfLessThanStart(timetable.startTime, endTime)
    })
  }

  /** Set whether this modification uses exact times */
  setExactTimes = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.update({exactTimes: e.currentTarget.checked})

  render () {
    const {
      allPhaseFromTimetableStops,
      bidirectional,
      modificationStops,
      timetable,
      update
    } = this.props
    return (
      <div>
        <Days setDay={this.setDay} timetable={timetable} />
        <MinutesSeconds
          label='Frequency'
          onChange={this.setHeadway}
          seconds={timetable.headwaySecs}
        />
        <TimePicker
          label='Start time'
          onChange={this.setStartTime}
          value={timetable.startTime}
        />
        <TimePicker
          label='End time'
          onChange={this.setEndTime}
          value={timetable.endTime}
        />
        <Checkbox
          label='Times are exact'
          checked={timetable.exactTimes}
          onChange={this.setExactTimes}
          disabled={!!timetable.phaseAtStop}
        />
        {timetable.phaseAtStop &&
          <div className='alert alert-info' role='alert'>
            {messages.phasing.exactTimesWarning}
          </div>}
        <Phase
          availableTimetables={this.state.availableTimetables}
          disabled={!!(timetable.exactTimes || bidirectional)}
          modificationStops={modificationStops}
          phaseAtStop={timetable.phaseAtStop}
          phaseFromTimetable={timetable.phaseFromTimetable}
          phaseFromStop={timetable.phaseFromStop}
          phaseSeconds={timetable.phaseSeconds}
          selectedPhaseFromTimetableStops={
            allPhaseFromTimetableStops[timetable.phaseFromTimetable]
          }
          timetableHeadway={timetable.headwaySecs}
          update={update}
        />
      </div>
    )
  }
}

const modBy24hours = time => time % (60 * 60 * 24)
const add24hoursToEndIfLessThanStart = (start, end) =>
  (end < start ? end + 60 * 60 * 24 : end)

function Days ({setDay, timetable}) {
  return (
    <div className='form-inline'>
      {DAYS.map(day => {
        const name = day.toLowerCase()
        return (
          <Checkbox
            checked={timetable[name]}
            key={`${name}-checkbox`}
            label={day.slice(0, 3)}
            onChange={e => setDay(name, e.target.checked)}
          />
        )
      })}
    </div>
  )
}

function getAvailableTimetables (props: Props): Timetable[] {
  const {projectTimetables, timetable} = props
  return projectTimetables.filter(tt => tt._id !== timetable._id)
}
