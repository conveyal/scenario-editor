import flatten from 'lodash/flatten'
import React from 'react'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import L from 'lib/leaflet'
import {getPatternsForModification} from 'lib/utils/patterns'

import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import MiniMap from './mini-map'
import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'

export default function RemoveStops(props) {
  const {modification, feedsById} = props
  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])

  const bounds = L.latLngBounds(
    flatten(
      route.patterns.map((p) =>
        p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
      )
    )
  )

  const patterns = getPatternsForModification({feed, modification})

  if (patterns == null) return <div />

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
          <PatternLayer feed={feed} modification={modification} />
          <StopLayer
            selectedColor={colors.REMOVED}
            feed={feed}
            modification={modification}
          />
        </MiniMap>
      </Box>

      <Box textAlign='center'>
        <i>{message('report.removeStops.stopsRemoved')}</i>
      </Box>
      <List styleType='disc'>
        {modification.stops &&
          modification.stops
            .map((s) => feed.stopsById[s])
            .map((s) => (
              <ListItem key={`stop-${s.stop_id}`}>{s.stop_name}</ListItem>
            ))}
      </List>

      {modification.secondsSaved > 0 && (
        <Box>
          {message('report.removeStops.secondsSaved', {
            secondsSaved: modification.secondsSaved
          })}
        </Box>
      )}

      <Box>
        <i>
          {message(
            'report.removeStops.' +
              (allPatterns ? 'allPatterns' : 'somePatterns')
          )}
        </i>
      </Box>

      {!allPatterns && (
        <List styleType='disc'>
          {patterns.map((p) => (
            <ListItem key={`pattern-${p.trips[0].trip_id}`}>{p.name}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
