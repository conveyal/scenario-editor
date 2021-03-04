/** Report out an adjust-speed modification */
import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'
import flatten from 'lodash/flatten'
import React from 'react'

import L from 'lib/leaflet'
import message from 'lib/message'
import {getPatternsForModification} from 'lib/utils/patterns'

import AdjustSpeedLayer from '../modifications-map/adjust-speed-layer'

import MiniMap from './mini-map'

export default function AdjustSpeed(p) {
  const feed = p.feedsById[p.modification.feed]
  const route = feed.routes.find((r) => r.route_id === p.modification.routes[0])

  const bounds = L.latLngBounds(
    flatten(
      route.patterns.map((p) =>
        p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
      )
    )
  )

  const patterns = getPatternsForModification({
    feed,
    modification: p.modification
  })

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
          <AdjustSpeedLayer feed={feed} modification={p.modification} />
        </MiniMap>
      </Box>

      <Box>
        {message('report.adjustSpeed.scale', {scale: p.modification.scale})}
      </Box>

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
