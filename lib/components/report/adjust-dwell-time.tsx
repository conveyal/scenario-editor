import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'

import colors from 'lib/constants/colors'
import {useRoutePatterns, useRouteStops} from 'lib/gtfs/hooks'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'
import useModificationRoute from 'lib/modification/hooks/use-modification-route'

import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import MiniMap from './mini-map'

/**
 * Report out an adjust-dwell-time modification.
 */
export default function AdjustDwellTime({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.AdjustDwellTime
}) {
  const bundleId = bundle._id
  const feedId = modification.feed
  const routeId = modification.routes[0]
  const route = useModificationRoute(bundle, modification)
  const routePatterns = useRoutePatterns(bundleId, feedId, routeId)
  const patterns = useModificationPatterns(bundle, modification)
  const bounds = useModificationBounds(bundle, modification)
  const stops = useRouteStops(bundleId, feedId, routeId)

  if (patterns == null) return null

  const allPatterns = patterns.length === routePatterns.length

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}: {route.name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <PatternLayer
            activeTrips={modification.trips}
            bundleId={bundleId}
            color={colors.NEUTRAL_LIGHT}
            modification={modification}
          />
          <StopLayer
            bundleId={bundleId}
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
            .map((id) => stops.find((s) => s.id === id))
            .map((s) => <li key={`stop-${s.id}`}>{s.name}</li>)}
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
            <ListItem key={p.name}>{p.name}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
