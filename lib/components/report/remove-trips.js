// @flow
import React, {PureComponent} from 'react'
import {latLngBounds} from 'leaflet'

import messages from '../../utils/messages'
import PatternLayer from '../modifications-map/pattern-layer'
import colors from '../../constants/colors'

import MiniMap from './mini-map'

/**
 * Removed trips
 */
export default class RemoveTrips extends PureComponent<Props, State> {
  render () {
    const {feedsById, modification} = this.props
    const feed = feedsById[modification.feed]
    const route = feed.routes.find(r => r.route_id === modification.routes[0])

    const bounds = latLngBounds(
      [].concat(
        route.patterns.map(p =>
          p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
        )
      )
    )

    return (
      <div>
        <h3>
          {messages.common.route}:{' '}
          {!!route.route_short_name && route.route_short_name}{' '}
          {!!route.route_long_name && route.route_long_name}
        </h3>

        <MiniMap bounds={bounds}>
          <PatternLayer
            color={colors.REMOVED}
            feed={feed}
            modification={modification}
          />
        </MiniMap>

        {modification.trips == null &&
          <i>
            {messages.report.removeTrips.removeEntireRoute}
          </i>}
        {modification.trips != null &&
          <div>
            <i>
              {messages.report.removeTrips.removePatterns}
            </i>
            <ul>
              {route.patterns
                .filter(
                  p =>
                    p.trips.findIndex(
                      (m) => modification.trips.indexOf(m.trip_id) > -1
                    ) > -1
                )
                .map(p => (
                  <li key={`pattern-${p.trips[0].trip_id}`}>
                    {p.name}
                  </li>
                ))}
            </ul>
          </div>}
      </div>
    )
  }
}
