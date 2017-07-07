// @flow
import React, {Component} from 'react'

import {Button} from '../buttons'
import {
  MAP_STATE_HIGHLIGHT_SEGMENT,
  MAP_STATE_HIGHLIGHT_STOP,
  MAP_STATE_SELECT_FROM_STOP,
  MAP_STATE_SELECT_TO_STOP
} from '../../constants'
import Icon from '../icon'
import {Group} from '../input'

import EditAlignment from './edit-alignment'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SegmentSpeeds from './segment-speeds'

import type {Feed, Modification, MapState, Pattern, Stop} from '../../types'

type Props = {
  feeds: Feed[],
  modification: Modification,
  mapState: MapState,
  qualifiedStops: Stop[],
  routePatterns: Pattern[],
  segmentDistances: number[],
  selectedFeed: Feed,
  stops: Stop[],
  setMapState(MapState): void,
  update(any): void
}

/**
 * Reroute an existing line. Takes a start and end stop ID, and replaces all
 * stops between those with the specified routing/set of stops
 */
export default class Reroute extends Component<void, Props, void> {
  _onSelectorChange = ({feed, routes, trips}: {
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => {
    const {update} = this.props
    update({
      feed,
      routes,
      trips
    })
  }

  _highlightSegment = (segmentIndex: number) => {
    const {setMapState} = this.props
    setMapState({
      state: MAP_STATE_HIGHLIGHT_SEGMENT,
      segmentIndex
    })
  }

  _highlightStop = (stopIndex: number) => {
    this.props.setMapState({
      state: MAP_STATE_HIGHLIGHT_STOP,
      stopIndex
    })
  }

  _selectFromStop = () => {
    this.props.setMapState({
      state: MAP_STATE_SELECT_FROM_STOP
    })
  }

  _selectToStop = () => {
    this.props.setMapState({
      state: MAP_STATE_SELECT_TO_STOP
    })
  }

  render () {
    const {
      feeds,
      mapState,
      modification,
      qualifiedStops,
      routePatterns,
      segmentDistances,
      selectedFeed,
      setMapState,
      stops,
      update
    } = this.props
    const hasFeedAndRoutes = selectedFeed && modification.routes
    const fromStopLabel = `From stop: ${modification.fromStop ? selectedFeed.stopsById[modification.fromStop].stop_name : '(none)'}`
    const toStopLabel = `To stop: ${modification.toStop ? selectedFeed.stopsById[modification.toStop].stop_name : '(none)'}`

    let numberOfStops = stops.length
    // don't include dwells at first and last stops
    if (modification.fromStop) numberOfStops--
    if (modification.toStop) numberOfStops--

    return (
      <div>
        <SelectFeedRouteAndPatterns
          feeds={feeds}
          onChange={this._onSelectorChange}
          routePatterns={routePatterns}
          routes={modification.routes}
          selectedFeed={selectedFeed}
          trips={modification.trips}
          />

        {hasFeedAndRoutes &&
          <div>
            <Group label={fromStopLabel}>
              <Button block onClick={this._selectFromStop} style='info'><Icon type='crosshairs' /> Select</Button>
            </Group>
            <Group label={toStopLabel}>
              <Button block onClick={this._selectToStop} style='info'><Icon type='crosshairs' /> Select</Button>
            </Group>
          </div>}

        <EditAlignment
          extendFromEnd={modification.toStop == null}
          mapState={mapState}
          modification={modification}
          setMapState={setMapState}
          update={update}
          />

        <SegmentSpeeds
          dwellTime={modification.dwellTime}
          dwellTimes={modification.dwellTimes || []}
          highlightSegment={this._highlightSegment}
          highlightStop={this._highlightStop}
          numberOfStops={numberOfStops}
          qualifiedStops={qualifiedStops}
          segmentDistances={segmentDistances}
          segmentSpeeds={modification.segmentSpeeds}
          update={update}
          />

      </div>
    )
  }
}
