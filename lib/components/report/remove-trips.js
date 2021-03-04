import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'
import flatten from 'lodash/flatten'
import React from 'react'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import L from 'lib/leaflet'

import PatternLayer from '../modifications-map/pattern-layer'

import MiniMap from './mini-map'

/**
 * Removed trips
 */
export default function RemoveTrips(p) {
  const {feedsById, modification} = p
  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])

  const bounds = L.latLngBounds(
    flatten(
      route.patterns.map((p) =>
        p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
      )
    )
  )

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
            color={colors.REMOVED}
            feed={feed}
            modification={modification}
          />
        </MiniMap>
      </Box>

      {modification.trips == null && (
        <Box textAlign='center'>
          <i>{message('report.removeTrips.removeEntireRoute')}</i>
        </Box>
      )}
      {modification.trips != null && (
        <Stack>
          <Box textAlign='center'>
            <i>{message('report.removeTrips.removePatterns')}</i>
          </Box>
          <List styleType='disc'>
            {route.patterns
              .filter(
                (p) =>
                  p.trips.findIndex(
                    (t) => modification.trips.indexOf(t.trip_id) > -1
                  ) > -1
              )
              .map((p) => (
                <ListItem key={`pattern-${p.trips[0].trip_id}`}>
                  {p.name}
                </ListItem>
              ))}
          </List>
        </Stack>
      )}
    </Stack>
  )
}
