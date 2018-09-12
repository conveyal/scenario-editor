// @flow
import isEqual from 'lodash/isEqual'
import memoize from 'lodash/memoize'
import sum from 'lodash/sum'
import React, {PureComponent} from 'react'

import {DEFAULT_SEGMENT_SPEED} from '../../constants/timetables'
import Collapsible from '../collapsible'
import {Group, Input, Number as InputNumber} from '../input'
import MinutesSeconds from '../minutes-seconds'
import {toPrecision} from '../../utils/math'
import {
  getAverageSpeedOfSegments,
  getTravelTimeMinutes
} from '../../utils/segments'
import type {Stop} from '../../types'

type Props = {
  dwellTime: number,
  dwellTimes: number[],
  highlightSegment: (number) => void,
  highlightStop: (number) => void,
  numberOfStops: number,
  qualifiedStops: Stop[],

  segmentDistances: number[],
  segmentSpeeds: number[],
  update: (any) => void
}

type State = {
  segmentSpeedsAreEqual: boolean
}

export default class SegmentSpeeds extends PureComponent<void, Props, State> {
  __confirmedSetAllSpeedsOnce: boolean
  __confirmedSetSpeedFromTravelTimeOnce: boolean

  state = {
    segmentSpeedsAreEqual: this.areSegmentSpeedsEqual()
  }

  areSegmentSpeedsEqual () {
    const {segmentSpeeds} = this.props
    return segmentSpeeds.every(speed => speed === segmentSpeeds[0])
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(nextProps.segmentDistances, this.props.segmentDistances)) {
      this._setSegmentSpeedsLengthTo(nextProps)
    }

    this.setState({segmentSpeedsAreEqual: this.areSegmentSpeedsEqual()})
  }

  componentDidMount () {
    const {segmentDistances, segmentSpeeds} = this.props
    if (segmentDistances.length !== segmentSpeeds.length) {
      this._setSegmentSpeedsLengthTo(this.props)
    }
  }

  _highlightSegment = memoize((index: number) => () =>
    this.props.highlightSegment(index))

  _highlightStop = memoize((index: number) => () =>
    this.props.highlightStop(index))

  /**
   * Pass in props directly here since this function is called on new props.
   */
  _setSegmentSpeedsLengthTo ({segmentSpeeds, segmentDistances, update}: Props) {
    const newLength = segmentDistances.length
    const newSegmentSpeeds = segmentSpeeds.slice(0, newLength)
    while (newSegmentSpeeds.length < newLength) {
      newSegmentSpeeds.push(segmentSpeeds[0] || DEFAULT_SEGMENT_SPEED)
    }
    update({segmentSpeeds: newSegmentSpeeds})
  }

  _confirmedSetAllSpeedsOnce () {
    if (!this.__confirmedSetAllSpeedsOnce) {
      this.__confirmedSetAllSpeedsOnce = window.confirm(
        `Setting the average speed will change all of the segment speeds. Do you wish to continue?`
      )
    }

    return !!this.__confirmedSetAllSpeedsOnce
  }

  _setAllSegmentSpeedsTo = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const newSpeed = Number(e.target.value)
    if (
      e.target.value &&
      !isNaN(newSpeed) &&
      (this.state.segmentSpeedsAreEqual || this._confirmedSetAllSpeedsOnce())
    ) {
      const {segmentSpeeds, update} = this.props
      update({segmentSpeeds: segmentSpeeds.map(() => newSpeed)})
    }
  }

  _setDwell = (dwellTime: number) => {
    const {update} = this.props
    update({dwellTime})
  }

  _setDwellTimeForStop = memoize((index: number) => seconds => {
    let {dwellTime, dwellTimes, qualifiedStops, update} = this.props
    dwellTimes = dwellTimes || qualifiedStops.map(() => dwellTime)
    dwellTimes[index] = seconds
    update({dwellTimes})
  })

  _setSpeedForSegment = memoize(index => e => {
    const {segmentSpeeds, update} = this.props
    const speed = Number(e.target.value)
    if (!isNaN(speed) && speed !== 0) {
      const newSpeeds = segmentSpeeds.slice()
      newSpeeds[index] = speed
      update({segmentSpeeds: newSpeeds})
    }
  })

  _confirmedSetSpeedFromTravelTimeOnce () {
    if (!this.__confirmedSetSpeedFromTravelTimeOnce) {
      this.__confirmedSetSpeedFromTravelTimeOnce = window.confirm(
        `Setting the total travel time will change all of the segment speeds. Do you wish to continue?`
      )
    }

    return !!this.__confirmedSetSpeedFromTravelTimeOnce
  }

  _getTotalDwellSeconds () {
    const {dwellTime, dwellTimes, numberOfStops} = this.props
    let totalDwellSeconds = numberOfStops * dwellTime
    if (dwellTimes) {
      totalDwellSeconds -= dwellTime * dwellTimes.length
      totalDwellSeconds += sum(dwellTimes)
    }
    return totalDwellSeconds
  }

  _setSpeedFromTravelTime = (travelTimeSeconds: number) => {
    if (
      travelTimeSeconds !== 0 &&
      (this.state.segmentSpeedsAreEqual ||
        this._confirmedSetSpeedFromTravelTimeOnce())
    ) {
      const {numberOfStops, segmentDistances, update} = this.props
      // figure out appropriate speed given this travel time
      if (numberOfStops !== 0) {
        const travelTime = travelTimeSeconds - this._getTotalDwellSeconds()
        const totalKilometers = sum(segmentDistances)
        // figure out speed
        const speedKps = travelTime >= 1
          ? totalKilometers / travelTime
          : totalKilometers
        const speedKph = speedKps * 3600
        update({segmentSpeeds: segmentDistances.map(() => speedKph)})
      }
    }
  }

  _setTimeForSegment = memoize(index => seconds => {
    const {segmentDistances, segmentSpeeds, update} = this.props
    if (seconds !== 0) {
      const newSpeeds = segmentSpeeds.slice()
      newSpeeds[index] = segmentDistances[index] / (seconds / 60 / 60)
      update({segmentSpeeds: newSpeeds})
    }
  })

  render () {
    const {
      dwellTime,
      dwellTimes,
      numberOfStops,
      qualifiedStops,
      segmentDistances,
      segmentSpeeds
    } = this.props

    const averageSpeed =
      getAverageSpeedOfSegments({
        segmentDistances,
        segmentSpeeds
      }) || DEFAULT_SEGMENT_SPEED

    const travelTime = getTravelTimeMinutes({
      dwellTime,
      numberOfStops,
      segmentDistances,
      segmentSpeeds
    })

    return (
      <div>
        <MinutesSeconds
          label='Dwell time'
          onChange={this._setDwell}
          seconds={dwellTime}
        />
        {qualifiedStops &&
          <Collapsible title='Set individual stop dwell times'>
            {qualifiedStops.map((stop, index) => (
              <MinutesSeconds
                key={`segment-speeds-stop-dwell-time-${index}`}
                label={`Stop ${index}`}
                placeholder='Dwell time'
                onBlur={this._highlightStop(-1)}
                onChange={this._setDwellTimeForStop(index)}
                onFocus={this._highlightStop(index)}
                seconds={
                  isNaN(parseInt(dwellTimes[index]))
                    ? dwellTime
                    : dwellTimes[index]
                }
              />
            ))}
          </Collapsible>}
        <InputNumber
          label='Average segment speed'
          min={1}
          onChange={this._setAllSegmentSpeedsTo}
          units='km/h'
          value={toPrecision(averageSpeed)}
        />
        <MinutesSeconds
          label='Total travel time'
          onChange={this._setSpeedFromTravelTime}
          seconds={travelTime * 60}
        />
        <Collapsible title='Set individual segment speeds'>
          {segmentSpeeds.map((speed, index) => (
            <Group
              key={`segment-speed-time-group-${index}`}
              label={`Segment ${index + 1}`}
            >
              <Input
                placeholder='Speed'
                min={1}
                onBlur={this._highlightSegment(-1)}
                onChange={this._setSpeedForSegment(index)}
                onFocus={this._highlightSegment(index)}
                value={speed}
                units='km/h'
              />
              <MinutesSeconds
                placeholder='Time'
                onBlur={this._highlightSegment(-1)}
                onChange={this._setTimeForSegment(index)}
                onFocus={this._highlightSegment(index)}
                seconds={segmentDistances[index] / speed * 60 * 60}
              />
            </Group>
          ))}
        </Collapsible>
      </div>
    )
  }
}
