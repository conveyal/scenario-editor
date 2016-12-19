/** Represents a PatternTimetable */

import React, {PropTypes} from 'react'
import lineDistance from 'turf-line-distance'

import DeepEqual from '../deep-equal'
import {Text, Number as InputNumber} from '../input'
import {Button} from '../buttons'
import Icon from '../icon'
import SegmentSpeeds from './segment-speeds'

import TimetableEntry from './timetable-entry'

export default class Timetable extends DeepEqual {
  static propTypes = {
    timetable: PropTypes.object.isRequired,
    travelTime: PropTypes.number.isRequired,
    remove: PropTypes.func.isRequired,
    segments: PropTypes.array.isRequired,
    update: PropTypes.func.isRequired
  }

  state = {
    collapsed: false
  }

  /** set the speed of the modification (km/h) */
  _setSpeed = (e) => {
    const {update} = this.props
    update({speed: Number(e.target.value)})
  }

  _setSpeeds = (speeds) => {
    const {update} = this.props
    update({speeds})
  }

  /** set the dwell time of the modification (seconds) */
  _setDwell = (e) => {
    const {update} = this.props
    update({dwellTime: Number(e.target.value)})
  }

  _changeName = (e) => {
    const {update} = this.props
    update({name: e.target.value})
  }

  _remove = () => {
    if (window.confirm('Are you sure you would like to remove this timetable?')) {
      this.props.remove()
    }
  }

  _setSpeedFromTravelTime = (e) => {
    const travelTimeMinutes = parseFloat(e.target.value)
    const travelTimeIsValid = travelTimeMinutes !== null && !isNaN(travelTimeMinutes)
    if (travelTimeIsValid) this.props.setSpeedFromTravelTime(travelTimeMinutes)
  }

  _toggleCollapsed = () => {
    this.setState({
      ...this.state,
      collapsed: !this.state.collapsed
    })
  }

  _setSpeeds = (speeds) => {
    const {segments, timetable, update} = this.props
    update({
      speeds,
      speed: speeds.length > 0 ? getAverageSpeedOfSegments({segments, speeds}) : timetable.speed
    })
  }

  render () {
    const {segments, timetable, travelTime, update} = this.props
    const {collapsed} = this.state
    return (
      <section className='panel panel-default inner-panel'>
        <div
          className='panel-heading clearfix'
          onClick={this._toggleCollapsed}
          style={{cursor: 'pointer'}}>
          <Icon type={collapsed ? 'chevron-right' : 'chevron-down'} />
          <strong> {timetable.name}</strong>
        </div>

        {!collapsed &&
          <div className='panel-body'>
            <Text
              name='Name'
              onChange={this._changeName}
              value={timetable.name}
              />
            <TimetableEntry
              update={update}
              timetable={timetable}
              />
            <InputNumber
              label='Average Speed (km/h)'
              onChange={this._setSpeed}
              value={timetable.speed}
              />
            <SegmentSpeeds
              defaultSpeed={timetable.speed}
              segments={segments}
              speeds={timetable.speeds || []}
              setSpeeds={this._setSpeeds}
              />
            <InputNumber
              label='Dwell time (seconds)'
              onChange={this._setDwell}
              value={timetable.dwellTime}
              />
            <InputNumber
              label='Travel time (mins)'
              onChange={this._setSpeedFromTravelTime}
              value={travelTime}
              />
            <Button
              block
              onClick={this._removeTimetable}
              style='danger'
              title='Delete timetable'
              >
              <Icon type='close' /> Delete Timetable
            </Button>
          </div>
        }
      </section>
    )
  }
}

function getAverageSpeedOfSegments ({segments, speeds}) {
  const segmentDistances = segments
    .map((s) => lineDistance(s.geometry, 'kilometers'))
  const totalDistance = segmentDistances.reduce((a, b) => (a + b), 0)
  const weightedSpeeds = speeds.map((s, i) => (s * segmentDistances[i]))
  return weightedSpeeds.reduce((total, speed) => (total + speed), 0) / totalDistance
}
