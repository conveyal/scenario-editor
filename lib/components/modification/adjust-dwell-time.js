// @flow
import React, {Component} from 'react'

import {Number as InputNumber} from '../input'
import type {
  Modification,
  Feed,
  MapState,
  RoutePatterns,
  Stop
} from '../../types'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

type Props = {
  feeds: Feed[],
  modification: Modification,
  routePatterns: RoutePatterns,
  routeStops: Stop[],
  selectedFeed: Feed | void,
  selectedStops: Stop[],
  setMapState(MapState): void,
  update: (any) => void,
  updateAndRetrieveFeedData: (any) => void
}

/**
 * Change dwell times
 */
export default class AdjustDwellTimeComponent extends Component<Props> {
  _onPatternSelectorChange = ({
    feed,
    routes,
    trips
  }: {
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => {
    this.props.updateAndRetrieveFeedData({feed, routes, trips, stops: null})
  }

  /** we are setting a scale for existing speeds, not an actual speed */
  _setScale = (e: SyntheticInputEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) this.props.update({scale: true})
  }

  /** we are setting a brand-new speed, throwing out any existing variation in speed */
  _setSpeed = (e: SyntheticInputEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) this.props.update({scale: false})
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  _setValue = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.update({value: e.target.value})
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
            <input
              id='adjust-dwell-time-scale'
              type='radio'
              value='scale'
              checked={modification.scale}
              onChange={this._setScale}
            />
            {' '}
            Scale existing dwell times by
          </label>
          <label htmlFor='adjust-dwell-time-speed'>
            <input
              id='adjust-dwell-time-speed'
              type='radio'
              value='speed'
              checked={!modification.scale}
              onChange={this._setSpeed}
            />
            {' '}
            Set new dwell time to
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
