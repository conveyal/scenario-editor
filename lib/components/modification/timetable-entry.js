/** Superclass for both changing frequencies and creating patterntimetables for new patterns */

import assert from 'assert'
import React, {Component, PropTypes} from 'react'

import {Checkbox, Number as InputNumber, Text} from '../input'
import {secondsToHhMmString} from '../../utils/time'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_LOWER_CASE = DAYS.map((d) => d.toLowerCase())

export default class TimetableEntry extends Component {
  static propTypes = {
    timetable: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired
  }

  /** set a particular day of the week as having or not having service */
  setDay = (day, value) => {
    assert(DAYS_LOWER_CASE.indexOf(day) !== -1, `${day} is not a day of the week`)
    const {update} = this.props
    update({[day]: value})
  }

  /** set the headway of the modification */
  setHeadway = (e) => {
    const {update} = this.props
    update({headwaySecs: Number(e.target.value) * 60})
  }

  /** set the start time of this modification */
  setStartTime = (e) => {
    const timeSplit = e.target.value.split(':')
    const startTime = modBy24hours(Number(timeSplit[0]) * 3600 + Number(timeSplit[1]) * 60)
    const {timetable, update} = this.props
    update({
      startTime,
      endTime: add24hoursToEndIfLessThanStart(startTime, timetable.endTime)
    })
  }

  /** set the end time of this modification */
  setEndTime = (e) => {
    const timeSplit = e.target.value.split(':')
    const endTime = modBy24hours(Number(timeSplit[0]) * 3600 + Number(timeSplit[1]) * 60)
    const {timetable, update} = this.props
    update({
      endTime: add24hoursToEndIfLessThanStart(timetable.startTime, endTime)
    })
  }

  render () {
    const {timetable} = this.props

    return (
      <div>
        <Days
          setDay={this.setDay}
          timetable={timetable}
          />
        <InputNumber
          label='Frequency (minutes)'
          onChange={this.setHeadway}
          value={timetable.headwaySecs / 60}
          />
        <Text
          label='Start time'
          onChange={this.setStartTime}
          type='time'
          value={secondsToHhMmString(timetable.startTime)}
          />
        <Text
          label='End time'
          onChange={this.setEndTime}
          type='time'
          value={secondsToHhMmString(timetable.endTime)}
          />
      </div>
    )
  }
}

const modBy24hours = (time) => (time % (60 * 60 * 24))
const add24hoursToEndIfLessThanStart = (start, end) => end < start
  ? (end + (60 * 60 * 24))
  : end

function Days ({setDay, timetable}) {
  return (
    <div className='form-inline'>
      {DAYS.map((day) => {
        const name = day.toLowerCase()
        return <Checkbox
          checked={timetable[name]}
          key={`${name}-checkbox`}
          label={day.slice(0, 3)}
          onChange={(e) => setDay(name, e.target.checked)}
          />
      })}
    </div>
  )
}
