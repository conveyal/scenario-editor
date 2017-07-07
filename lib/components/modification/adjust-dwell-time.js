// @flow
import React, {Component} from 'react'

import {Number as InputNumber} from '../input'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

import type {Feed, MapState, Modification, Pattern, Stop} from '../../types'

type Props = {
  feeds: Feed[],
  modification: Modification,
  routePatterns: Pattern[],
  routeStops: Stop[],
  selectedFeed: Feed | void,
  selectedStops: Stop[],
  setMapState(MapState): void,
  update(any): void
}

/**
 * Change dwell times
 */
export default class AdjustDwellTime extends Component<void, Props, void> {
  _onPatternSelectorChange = ({feed, routes, trips}: {
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => {
    this.props.update({feed, routes, trips, stops: null})
  }

  /** we are setting a scale for existing speeds, not an actual speed */
  _setScale = (e: Event & {currentTarget: HTMLInputElement}) => {
    if (e.currentTarget.checked) this.props.update({scale: true})
  }

  /** we are setting a brand-new speed, throwing out any existing variation in speed */
  _setSpeed = (e: Event & {currentTarget: HTMLInputElement}) => {
    if (e.currentTarget.checked) this.props.update({scale: false})
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  _setValue = (e: Event & {currentTarget: HTMLInputElement}) => {
    this.props.update({value: e.currentTarget.value})
  }

  render () {
    const {
      feeds,
      modification,
      routePatterns,
      routeStops,
      selectedFeed,
      selectedStops,
      setMapState,
      update
    } = this.props

    return (
      <div>
        <SelectFeedRouteAndPatterns
          feeds={feeds}
          onChange={this._onPatternSelectorChange}
          routes={modification.routes}
          routePatterns={routePatterns}
          selectedFeed={selectedFeed}
          trips={modification.trips}
          />

        {modification.routes &&
          <SelectStops
            modification={modification}
            setMapState={setMapState}
            routeStops={routeStops}
            selectedStops={selectedStops}
            update={update}
            />}

        <div className='form-group'>
          <label htmlFor='adjust-dwell-time-scale'>
            <input id='adjust-dwell-time-scale' type='radio' value='scale' checked={modification.scale} onChange={this._setScale} /> Scale existing dwell times by
          </label>
          <label htmlFor='adjust-dwell-time-speed'>
            <input id='adjust-dwell-time-speed' type='radio' value='speed' checked={!modification.scale} onChange={this._setSpeed} /> Set new dwell time to
          </label>
        </div>

        <InputNumber
          min={0}
          onChange={this._setValue}
          value={modification.value}
          />
      </div>
    )
  }
}
