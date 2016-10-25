/** show selected stops on the map */

import React, {Component, PropTypes} from 'react'
import {latLng} from 'leaflet'
import {FeatureGroup, CircleMarker} from 'react-leaflet'

import colors from '../utils/colors'

export default class StopLayer extends Component {
  static defaultProps = {
    nullIsWildcard: false,
    unselectedColor: colors.NEUTRAL,
    selectedColor: colors.MODIFIED
  }

  static propTypes = {
    feed: PropTypes.object,
    modification: PropTypes.object.isRequired,
    nullIsWildcard: PropTypes.bool.isRequired,
    onSelect: PropTypes.func,
    selectedColor: PropTypes.string.isRequired,
    unselectedColor: PropTypes.string.isRequired
  }

  render () {
    const {feed, modification, nullIsWildcard, onSelect, selectedColor, unselectedColor} = this.props
    // route has not yet been chosen
    if (!feed || modification.routes == null) return <g />

    let patterns = feed.routesById[modification.routes[0]].patterns

    // data has not yet been fetched
    if (patterns === undefined) return <g />

    if (modification.trips !== null) {
      patterns = patterns.filter((p) => {
        for (let trip of p.trips) {
          if (modification.trips.indexOf(trip.trip_id) > -1) return true
        }
        return false
      })
    }

    const routeStops = getUniqueStopsForPatterns({patterns, stopsById: feed.stopsById}) // TODO: Just pass in the route stops to this Component
    return (
      <FeatureGroup>
        {routeStops
          .map((stop) => {
            const stopIsSelected = nullIsWildcard && // TODO: not this
              modification.stops == null ||
              modification.stops != null &&
              modification.stops.indexOf(stop.stop_id) > -1
            const color = stopIsSelected
                ? selectedColor
                : unselectedColor

            return (
              <CircleMarker
                center={latLng(stop.stop_lat, stop.stop_lon)}
                key={`stop-layer-stop-${stop.stop_id}`}
                color={color}
                onClick={(e) => onSelect && onSelect(stop)}
                radius={4}
                />
            )
          })}
      </FeatureGroup>
    )
  }
}

function getUniqueStopsForPatterns ({
  patterns,
  stopsById
}) {
  const routeStopIds = new Set()
  patterns.forEach((p) => {
    p.stops.forEach((s) => routeStopIds.add(s.stop_id))
  })
  let stops = []
  routeStopIds.forEach((sid) => stops.push(stopsById[sid]))
  return stops
}
