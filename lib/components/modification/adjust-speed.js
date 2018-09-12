// @flow
import React, {Component} from 'react'

import {Button, Group} from '../buttons'
import {MAP_STATE_HOP_SELECTION} from '../../constants'
import messages from '../../utils/messages'
import {Group as FormGroup, Number} from '../input'
import type {Modification, Feed, MapState, RoutePatterns} from '../../types'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

type Props = {
  feeds: Feed[],
  modification: Modification,
  routePatterns: RoutePatterns,
  selectedFeed: Feed,
  setMapState(MapState): void,
  update(any): void,
  updateAndRetrieveFeedData: (any) => void
}

/**
 * Adjust speed on a route
 */
export default class AdjustSpeedComponent extends Component<void, Props, void> {
  onSelectorChange = (
    value: {
      feed: null | string,
      routes: null | string[],
      trips: null | string[]
    }
  ) => {
    const {feed, routes, trips} = value
    this.props.updateAndRetrieveFeedData({feed, routes, trips, hops: null})
  }

  newSelection = () => {
    const {modification, setMapState} = this.props
    setMapState({
      state: MAP_STATE_HOP_SELECTION,
      modification,
      action: 'new'
    })
  }

  addToSelection = () => {
    const {modification, setMapState} = this.props
    setMapState({
      state: MAP_STATE_HOP_SELECTION,
      modification,
      action: 'add'
    })
  }

  removeFromSelection = () => {
    const {modification, setMapState} = this.props
    setMapState({
      state: MAP_STATE_HOP_SELECTION,
      modification,
      action: 'remove'
    })
  }

  clearSegment = () => {
    this.props.update({hops: null})
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  setScale = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.update({scale: e.target.value})
  }

  render () {
    const {feeds, modification, routePatterns, selectedFeed} = this.props
    return (
      <form>
        <SelectFeedRouteAndPatterns
          allowMultipleRoutes
          feeds={feeds}
          onChange={this.onSelectorChange}
          routePatterns={routePatterns}
          routes={modification.routes}
          selectedFeed={selectedFeed}
          trips={modification.trips}
        />

        {modification.routes &&
          <FormGroup>
            <label htmlFor='Segment'>Segment</label>
            <Group justified>
              <Button onClick={this.newSelection}>{messages.common.select}</Button>
              <Button onClick={this.addToSelection}>{messages.common.addTo}</Button>
              <Button onClick={this.removeFromSelection}>{messages.common.removeFrom}</Button>
              <Button onClick={this.clearSegment}>{messages.common.clear}</Button>
            </Group>
          </FormGroup>}

        <Number
          label={messages.report.adjustSpeed.scaleLabel}
          name={messages.report.adjustSpeed.scaleLabel}
          min={0}
          onChange={this.setScale}
          step='any'
          value={modification.scale}
        />
      </form>
    )
  }
}
