// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'

import {Button, Group} from '../buttons'
import {
  MAP_STATE_HIGHLIGHT_SEGMENT,
  MAP_STATE_HIGHLIGHT_STOP,
  MAP_STATE_SELECT_FROM_STOP,
  MAP_STATE_SELECT_TO_STOP,
  MAP_STATE_TRANSIT_EDITOR
} from '../../constants'
import {Group as FormGroup} from '../input'
import messages from '../../utils/messages'

import EditAlignment from './edit-alignment'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SegmentSpeeds from './segment-speeds'

import type {Feed, MapState, RoutePatterns, Stop} from '../../types'

type Props = {
  feeds: Feed[],
  modification: any,
  mapState: MapState,
  qualifiedStops: Stop[],
  routePatterns: RoutePatterns,
  segmentDistances: number[],
  selectedFeed?: Feed,
  stops: Stop[],
  setMapState(MapState): void,
  update: (any) => void,
  updateAndRetrieveFeedData: (any) => void
}

/**
 * Reroute or extend an existing line.
 *
 * A reroute is specified with both a fromStop and toStop. Stops between those
 * stops in the baseline pattern will be replaced by the stops added through the
 * edit alignment functions in MAP_STATE_TRANSIT_EDITOR.  In the transit editor,
 * allowExtend is set to false, because the start and end of the reroute are
 * already set by fromStop and toStop.
 *
 * An extension is specified with either a fromStop or toStop. Stops added
 * through the edit alignment functions in MAP_STATE_TRANSIT_EDITOR will be
 * added to the baseline pattern.  If fromStop is set, extendFromEnd is set to
 * true, and stops are appended to the end of the baseline pattern.  If
 * toStop is set, extendFromEnd is set to false, and stops are prepended to
 * the beginning of the baseline pattern.  In both cases, allowExtend is true.
 */

export default class RerouteComponent extends Component<void, Props, void> {
  _onSelectorChange = ({
    feed,
    routes,
    trips
  }: {
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => {
    this.props.updateAndRetrieveFeedData({
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
    const {modification} = this.props
    this.props.setMapState({
      // don't allow extend if both fromStop and toStop are set.
      allowExtend: modification.toStop === null,
      // append stops to end of pattern
      extendFromEnd: true,
      state: MAP_STATE_SELECT_FROM_STOP
    })
  }

  _selectToStop = () => {
    const {modification} = this.props
    this.props.setMapState({
      // don't allow extend if both fromStop and toStop are set.
      allowExtend: modification.fromStop === null,
      // prepend stops to beginning of pattern
      extendFromEnd: false,
      state: MAP_STATE_SELECT_TO_STOP
    })
  }

  _updateAfterClearingStop = () => {
    const {update, modification} = this.props
    update(modification)
    this.props.setMapState({
      allowExtend: modification.toStop === null || modification.fromStop === null,
      extendFromEnd: modification.toStop === null,
      spacing: 0,
      state: MAP_STATE_TRANSIT_EDITOR
    })
  }

  _clearFromStop = () => {
    const {modification} = this.props
    if (modification.fromStop !== null) {
      modification.segments.shift()
      modification.fromStop = null
      if (modification.segments.length === 0) { modification.toStop = null }
      this._updateAfterClearingStop()
    }
  }

  _clearToStop = () => {
    const {modification} = this.props
    if (modification.toStop !== null) {
      modification.segments.pop()
      if (modification.segments.length === 0) { modification.fromStop = null }
      modification.toStop = null
      this._updateAfterClearingStop()
    }
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
    const fromStopValue = `${modification.fromStop && selectedFeed ? selectedFeed.stopsById[modification.fromStop].stop_name : '(none)'}`
    const toStopValue = `${modification.toStop && selectedFeed ? selectedFeed.stopsById[modification.toStop].stop_name : '(none)'}`

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
            <FormGroup>
              <label htmlFor='From Stop'>{messages.transitEditor.fromStopLabel}</label>
              {fromStopValue}
              <Group justified>
                <Button block onClick={this._selectFromStop} style='info'>
                  <Icon type='crosshairs' /> {messages.common.select}
                </Button>
                <Button block onClick={this._clearFromStop} style='danger'>
                  <Icon type='times' /> {messages.common.clear}
                </Button>
              </Group>
              <label htmlFor='To Stop'>{messages.transitEditor.toStopLabel}</label>
              {toStopValue}
              <Group justified>
                <Button block onClick={this._selectToStop} style='info'>
                  <Icon type='crosshairs' /> {messages.common.select}
                </Button>
                <Button block onClick={this._clearToStop} style='danger'>
                  <Icon type='times' /> {messages.common.clear}
                </Button>
              </Group>
            </FormGroup>

            <EditAlignment
              allowExtend={modification.toStop == null || modification.fromStop == null}
              extendFromEnd={modification.toStop == null}
              mapState={mapState}
              modification={modification}
              setMapState={setMapState}
              update={update}
              disabled={modification.segments.length < 1}
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
          </div>}
      </div>
    )
  }
}
