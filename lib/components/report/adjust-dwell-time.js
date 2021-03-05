import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'
import flatten from 'lodash/flatten'
import React from 'react'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import L from 'lib/leaflet'
import {getPatternsForModification} from 'lib/utils/patterns'

import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import MiniMap from './mini-map'

/**
 * Report out an adjust-dwell-time modification.
 */
export default function AdjustDwellTime(props) {
  const {modification, feedsById} = props
  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])

  const coords = flatten(
    route.patterns.map((p) =>
      p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
    )
  )
  const bounds = L.latLngBounds(coords)
  const patterns = getPatternsForModification({feed, modification})

  if (patterns == null) return null

  const allPatterns = patterns.length === route.patterns.length

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}:{' '}
        {!!route.route_short_name && route.route_short_name}{' '}
        {!!route.route_long_name && route.route_long_name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <PatternLayer
            color={colors.NEUTRAL_LIGHT}
            feed={feed}
            modification={modification}
          />
          <StopLayer
            feed={feed}
            modification={modification}
            nullIsWildcard
            selectedColor={colors.MODIFIED}
          />
        </MiniMap>
      </Box>

      <Box textAlign='center'>
        {modification.scale
          ? message('report.adjustDwellTime.scale', {scale: modification.value})
          : message('report.adjustDwellTime.set', {set: modification.value})}
      </Box>

      <Heading size='sm'>
        {message('report.adjustDwellTime.stopsModified')}
      </Heading>
      <List styleType='disc'>
        {modification.stops &&
          modification.stops
            .map((s) => feed.stopsById[s])
            .map((s) => <li key={`stop-${s.stop_id}`}>{s.stop_name}</li>)}
        {modification.stops == null && (
          <ListItem>
            <i>{message('report.adjustDwellTime.allStops')}</i>
          </ListItem>
        )}
      </List>

      <Heading size='sm'>
        {allPatterns
          ? message('report.removeStops.allPatterns')
          : message('report.removeStops.somePatterns')}
      </Heading>

      {!allPatterns && (
        <List>
          {patterns.map((p) => (
            <ListItem key={`pattern-${p.trips[0].trip_id}`}>{p.name}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
