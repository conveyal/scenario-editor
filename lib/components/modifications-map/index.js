// @flow
import debounce from 'lodash/debounce'
import React, {Component} from 'react'
import {FeatureGroup} from 'react-leaflet'

import {
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  MAP_STATE_HIGHLIGHT_SEGMENT,
  MAP_STATE_HIGHLIGHT_STOP,
  MAP_STATE_HOP_SELECTION,
  MAP_STATE_STOP_SELECTION,
  MAP_STATE_SELECT_FROM_STOP,
  MAP_STATE_SELECT_TO_STOP,
  MAP_STATE_TRANSIT_EDITOR,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE,
  UPDATE_DELAY_MS
} from '../../constants'
import colors from '../../constants/colors'
import updateAddStopsTerminus from '../../utils/update-add-stops-terminus'
import AddTripPatternLayer from './add-trip-pattern-layer'
import AdjustSpeedLayer from './adjust-speed-layer'
import HopSelectPolygon from './hop-select-polygon'
import PatternLayer from './pattern-layer'
import PatternStopsLayer from './pattern-stops-layer'
import RerouteLayer from './reroute-layer'
import StopLayer from './stop-layer'
import StopSelectPolygon from './stop-select-polygon'
import TransitEditor from './transit-editor'

import type {Feed, LonLat, Modification, Stop} from '../../types'

type Props = {
  activeModification?: Object,
  activeModificationFeed?: Feed,
  bundleId: string,
  centerLonLat: LonLat,
  feeds: Feed[],
  feedsById: {
    [feedId: string]: Feed
  },
  mapState: Object,
  modificationsOnMap: any[],
  qualifiedStops: Stop[],
  replaceModification: (modification: Object) => void,
  setMapState: Object => void
}

/**
 * A map component showing a project
 */
export default class ModificationsMap extends Component<any, Props, any> {
  updateModification = debounce((properties: any) => {
    const {activeModification, replaceModification} = this.props
    replaceModification({
      ...activeModification,
      ...properties
    })
  }, UPDATE_DELAY_MS)

  render () {
    const {
      activeModification,
      feedsById,
      mapState,
      modificationsOnMap
    } = this.props
    // Add trip pattern modifications do not have a feed property but should still be shown on the map.
    const dim = id => activeModification && activeModification._id !== id

    return (
      <FeatureGroup>
        {/* show patterns at the bottom */}
        {modificationsOnMap
          .filter(m => m.type === REMOVE_TRIPS)
          .map(m => (
            <PatternLayer
              color={colors.REMOVED}
              dim={dim(m._id)}
              feed={feedsById[m.feed]}
              key={m._id}
              modification={m}
            />
          ))}
        {modificationsOnMap
          .filter(m => m.type === CONVERT_TO_FREQUENCY)
          .map(m => (
            <PatternLayer
              activeTrips={mapState.activeTrips}
              activeModification={activeModification}
              color={colors.MODIFIED}
              dim={dim(m._id)}
              feed={feedsById[m.feed]}
              key={m._id}
              modification={m}
            />
          ))}
        {/* show patterns with added or removed stop in neutral gray, the stops/reroutes themselves will be shown as red or blue depending on whether they are removed or added. */}
        {modificationsOnMap
          .filter(m => m.type === REMOVE_STOPS || m.type === ADJUST_DWELL_TIME)
          .map(m => (
            <PatternStopsLayer
              selectedStopColor={
                m.type === REMOVE_STOPS ? colors.REMOVED : colors.MODIFIED
              }
              dim={dim(m._id)}
              nullIsWildcard={m.type === ADJUST_DWELL_TIME}
              feed={feedsById[m.feed]}
              key={m._id}
              modification={m}
            />
          ))}
        {modificationsOnMap
          .filter(m => m.type === ADJUST_SPEED)
          .map(m => (
            <AdjustSpeedLayer
              key={`adjust-speed-${m._id}`}
              dim={dim(m._id)}
              feed={feedsById[m.feed]}
              modification={m}
            />
          ))}
        }
        {modificationsOnMap
          .filter(m => m.type === REROUTE)
          .map(m => (
            <RerouteLayer
              dim={dim(m._id)}
              feed={feedsById[m.feed]}
              highlightSegment={this.getHighlightSegmentForModification(m)}
              highlightStop={this.getHighlightStopForModification(m)}
              key={`reroute-layer-${m._id}`}
              modification={m}
              showAddedSegment={
                mapState.state !== MAP_STATE_TRANSIT_EDITOR ||
                  !activeModification ||
                  activeModification._id !== m._id
              }
            />
          ))}
        {/* Added trip patterns. */}
        {modificationsOnMap
          .filter(({type}) => type === ADD_TRIP_PATTERN)
          // hide trip pattern currently being edited
          .filter(
            ({id}) =>
              !activeModification ||
              id !== activeModification._id ||
              mapState.state !== MAP_STATE_TRANSIT_EDITOR
          )
          // if there's only a single stop, don't render
          .filter(
            ({segments}) =>
              segments.length > 0 && segments[0].geometry.type !== 'Point'
          )
          .map(m => (
            <AddTripPatternLayer
              key={`add-trip-pattern-layer-${m._id}`}
              bidirectional={m.bidirectional}
              highlightSegment={this.getHighlightSegmentForModification(m)}
              highlightStop={this.getHighlightStopForModification(m)}
              segments={m.segments}
            />
          ))}
        {/* state-specific layers */}
        {this.renderStateSpecificLayers()}
      </FeatureGroup>
    )
  }

  getHighlightSegmentForModification (modification: Modification): number {
    const {activeModification, mapState} = this.props
    return !activeModification ||
      activeModification._id !== modification._id ||
      mapState.state !== MAP_STATE_HIGHLIGHT_SEGMENT
      ? -1
      : mapState.segmentIndex
  }

  getHighlightStopForModification (modification: Modification): Stop | null {
    const {activeModification, mapState, qualifiedStops} = this.props
    return !activeModification ||
      activeModification._id !== modification._id ||
      mapState.state !== MAP_STATE_HIGHLIGHT_STOP
      ? null
      : qualifiedStops[mapState.stopIndex]
  }

  _selectStops = (selectedStops: string[]) => {
    const {activeModification, mapState, setMapState} = this.props
    if (activeModification) {
      switch (mapState.action) {
        case 'add':
          this.updateModification({
            stops: [...new Set([...activeModification.stops, ...selectedStops])]
          })
          break
        case 'new':
          this.updateModification({stops: selectedStops})
          break
        case 'remove':
          this.updateModification({
            stops: activeModification.stops.filter(
              sid => selectedStops.indexOf(sid) === -1
            )
          })
          break
      }
    }
    setMapState({
      modification: null,
      state: null
    })
  }

  _selectHops = (hops: string[][]) => {
    const {activeModification, mapState, setMapState} = this.props
    if (activeModification) {
      switch (mapState.action) {
        case 'add':
          this.updateModification({
            hops: [...new Set([...activeModification.hops, ...hops])]
          })
          break
        case 'new':
          this.updateModification({hops})
          break
        case 'remove':
          this.updateModification({
            hops: activeModification.hops.filter(
              existing =>
                hops.findIndex(
                  selected =>
                    existing[0] === selected[0] && existing[1] === selected[1]
                ) === -1
            )
          })
          break
      }
    }
    setMapState({
      modification: null,
      state: null
    })
  }

  renderStateSpecificLayers () {
    const {
      activeModification,
      activeModificationFeed,
      feeds,
      mapState,
      replaceModification,
      setMapState
    } = this.props
    if (!activeModification) return
    switch (mapState.state) {
      case MAP_STATE_STOP_SELECTION:
        return (
          <StopSelectPolygon
            routeStops={mapState.routeStops}
            selectStops={this._selectStops}
          />
        )
      case MAP_STATE_HOP_SELECTION:
        return (
          <HopSelectPolygon
            hopStops={getHopStopsForModification({
              feed: activeModificationFeed,
              modification: activeModification
            })}
            selectHops={this._selectHops}
          />
        )
      case MAP_STATE_TRANSIT_EDITOR:
        return (
          <TransitEditor
            allowExtend={mapState.allowExtend}
            extendFromEnd={mapState.extendFromEnd}
            feeds={feeds}
            followRoad={!!mapState.followRoad}
            modification={activeModification}
            spacing={mapState.spacing}
            updateModification={this.updateModification}
          />
        )
      case MAP_STATE_SELECT_FROM_STOP:
      case MAP_STATE_SELECT_TO_STOP:
        return (
          <StopLayer
            feed={activeModificationFeed}
            modification={activeModification}
            nullIsWildcard
            onSelect={stop => {
              replaceModification(updateAddStopsTerminus({
                feed: activeModificationFeed,
                modification: activeModification,
                newStop: stop,
                which: mapState.state === MAP_STATE_SELECT_FROM_STOP
                  ? 'fromStop'
                  : 'toStop'
              }))
              setMapState({state: null})
            }}
            selectedColor={colors.ACTIVE}
          />
        )
    }
  }
}

// TODO: Move to selector
function getHopStopsForModification ({
  feed,
  modification
}: {
  feed: any,
  modification: any
}) {
  // get all hops from all (selected) patterns
  const route = feed.routes.find(r => r.route_id === modification.routes[0])
  if (!route) return []
  let patterns = route.patterns

  if (modification.trips !== null) {
    patterns = patterns.filter(
      pat =>
        pat.trips.findIndex(t => modification.trips.indexOf(t.trip_id) > -1) >
        -1
    )
  }

  const hopsForPattern = patterns.map(p =>
    p.stops.map(
      (stop, index, array) =>
        (index < array.length - 1
          ? [stop.stop_id, array[index + 1].stop_id]
          : null)
    )
  )

  // smoosh hops from all patterns together
  const candidateHops = [].concat(...hopsForPattern).filter(hop => hop != null)

  return candidateHops.map(hop => [
    feed.stopsById[hop[0]],
    feed.stopsById[hop[1]]
  ])
}
