// @flow
import message from '@conveyal/woonerf/message'
import React, {Component} from 'react'

import PatternStopsLayer from '../modifications-map/pattern-stops-layer'
import colors from '../../constants/colors'
import {getPatternsForModification} from '../../utils/patterns'
import {getRouteBounds} from '../../utils/routes'
import type {FeedsById, Modification} from '../../types'

import MiniMap from './mini-map'

type Props = {
  feedsById: FeedsById,
  modification: Modification
}

export default class AdjustDwellTime extends Component<Props> {
  render () {
    const {modification, feedsById} = this.props
    const feed = feedsById[modification.feed]

    const patterns = getPatternsForModification({feed, modification})
    if (patterns == null) return <div />

    const route = feed.routes.find(r => r.route_id === modification.routes[0])
    const bounds = getRouteBounds(route)
    const allPatterns = patterns.length === route.patterns.length

    return (
      <div>
        <h3>
          {message('common.route')}:{' '}
          {!!route.route_short_name && route.route_short_name}{' '}
          {!!route.route_long_name && route.route_long_name}
        </h3>

        <MiniMap bounds={bounds}>
          <PatternStopsLayer
            feed={feed}
            nullIsWildcard
            selectedStopColor={colors.MODIFIED}
            modification={modification}
          />
        </MiniMap>

        {modification.scale
          ? message('report.adjustDwellTime.scale', {scale: modification.value})
          : message('report.adjustDwellTime.set', {seconds: modification.value})}

        <br />

        <i>
          {message('report.adjustDwellTime.stopsModified')}
        </i>
        <ul>
          {modification.stops &&
            modification.stops.map(s => feed.stopsById[s]).map(s => (
              <li key={`stop-${s.stop_id}`}>
                {s.stop_name}
              </li>
            ))}
          {modification.stops == null &&
            <li>
              <i>
                {message('report.adjustDwellTime.allStops')}
              </i>
            </li>}
        </ul>

        {allPatterns
          ? <i>
            {message('report.removeStops.allPatterns')}
          </i>
          : <i>
            {message('report.removeStops.somePatterns')}
          </i>}

        {!allPatterns &&
          <ul>
            {patterns.map(p => (
              <li key={`pattern-${p.trips[0].trip_id}`}>
                {p.name}
              </li>
            ))}
          </ul>}
      </div>
    )
  }
}
