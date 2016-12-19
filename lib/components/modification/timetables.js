import React, {PropTypes} from 'react'

import {Button} from '../buttons'
import Icon from '../icon'
import DeepEqual from '../deep-equal'
import Timetable from './timetable'
import {create as createTimetable} from '../../utils/timetable'

export default class Timetables extends DeepEqual {
  static propTypes = {
    distance: PropTypes.number.isRequired,
    segments: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    timetables: PropTypes.array.isRequired,
    update: PropTypes.func.isRequired
  }

  /** add a timetable */
  _create = () => {
    const {timetables, update} = this.props
    const speeds = timetables.length > 0
      ? timetables[0].speeds
      : []
    update({
      timetables: [...timetables, createTimetable(speeds)]
    })
  }

  /** update a timetable */
  _update = (index, newTimetableProps) => {
    const timetables = [...this.props.timetables]
    timetables[index] = {
      ...timetables[index],
      ...newTimetableProps
    }
    this.props.update({timetables})
  }

  _remove = (index) => {
    const timetables = [...this.props.timetables]
    timetables.splice(index, 1)
    this.props.update({timetables})
  }

  _setSpeedFromTravelTime = (index, travelTimeMinutes) => {
    const {distance, timetables, stops} = this.props
    const timetable = timetables[index]
    // figure out appropriate speed given this travel time
    if (stops.length !== 0) {
      const totalDwellSeconds = stops.length * timetable.dwellTime
      const travelTimeSeconds = (travelTimeMinutes * 60) - totalDwellSeconds
      // figure out speed
      const speedMps = distance / travelTimeSeconds
      const speedKph = speedMps * 3600 / 1000
      this._update(index, {speed: speedKph})
    }
  }

  render () {
    const {distance, timetables, segments, stops} = this.props
    return (
      <div>
        {timetables.map((tt, i) => {
          return <Timetable
            key={`timetable-${i}`}
            update={this._update.bind(this, i)}
            remove={this._remove.bind(this, i)}
            segments={segments}
            setSpeedFromTravelTime={this._setSpeedFromTravelTime.bind(this, i)}
            travelTime={getTravelTimeMinutes({distance, stops, timetable: tt})}
            timetable={tt}
            />
        })}

        <Button
          block
          onClick={this._create}
          style='success'
          ><Icon type='plus' /> Add timetable
        </Button>
      </div>
    )
  }
}

function getTravelTimeMinutes ({
  distance,
  stops,
  timetable
}) {
  const nStops = stops.length

  let travelTime = 0
  if (nStops > 0) {
    travelTime = distance / 1000 / timetable.speed * 60
    // add the dwell times
    const dwellMinutes = timetable.dwellTime / 60
    travelTime += nStops * dwellMinutes
  }

  return travelTime
}
