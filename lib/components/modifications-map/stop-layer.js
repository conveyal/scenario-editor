// @flow
import React, {Component} from 'react'
import {FeatureGroup, CircleMarker} from 'react-leaflet'

import colors from '../../constants/colors'
import type {Feed, Modification} from '../../types'

type Props = {
  feed: Feed,
  modification: Modification,
  onSelect: (any) => void,
  selectedColor: string,

  // actions
  unselectedColor: string
}

/** show selected stops on the map */
export default class StopLayer extends Component<Props> {
  static defaultProps = {
    nullIsWildcard: false,
    unselectedColor: colors.NEUTRAL,
    selectedColor: colors.MODIFIED
  }

  render () {
    const {
      feed,
      modification,
      nullIsWildcard,
      onSelect,
      selectedColor,
      unselectedColor
    } = this.props
    // route has not yet been chosen
    if (!feed || modification.routes == null) return <g />
    const route = feed.routes.find(r => r.route_id === modification.routes[0])
    if (!route) return <g />
    let patterns = route.patterns

    // data has not yet been fetched
    if (patterns === undefined) return <g />

    if (modification.trips !== null) {
      patterns = patterns.filter(p => {
        for (const trip of p.trips) {
          if (modification.trips.indexOf(trip.trip_id) > -1) return true
        }
        return false
      })
    }

    const routeStops = getUniqueStopsForPatterns({
      patterns,
      stopsById: feed.stopsById
    }) // TODO: Just pass in the route stops to this Component
    return (
      <FeatureGroup>
        {routeStops.map(stop => {
          const stopIsSelected =
            (nullIsWildcard && modification.stops == null) ||
            (modification.stops != null &&
              modification.stops.indexOf(stop.stop_id) > -1)
          const color = stopIsSelected ? selectedColor : unselectedColor

          return (
            <CircleMarker
              center={[stop.stop_lat, stop.stop_lon]}
              key={`stop-layer-stop-${stop.stop_id}`}
              color={color}
              onClick={e => onSelect && onSelect(stop)}
              radius={4}
            />
          )
        })}
      </FeatureGroup>
    )
  }
}

function getUniqueStopsForPatterns ({patterns, stopsById}) {
  const routeStopIds = new Set()
  patterns.forEach(p => {
    p.stops.forEach(s => routeStopIds.add(s.stop_id))
  })
  const stops = []
  routeStopIds.forEach(sid => stops.push(stopsById[sid]))
  return stops
}
