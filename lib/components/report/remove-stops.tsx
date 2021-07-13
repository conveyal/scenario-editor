import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'

import colors from 'lib/constants/colors'
import {useRoutePatterns, useRouteStops} from 'lib/gtfs/hooks'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import useModificationRoute from 'lib/modification/hooks/use-modification-route'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'

import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import MiniMap from './mini-map'

export default function RemoveStops({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.RemoveStops
}) {
  const bounds = useModificationBounds(bundle, modification)
  const route = useModificationRoute(bundle, modification)
  const patterns = useModificationPatterns(bundle, modification)
  const stops = useRouteStops(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )
  const routePatterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )

  if (patterns == null) return <div />

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
            bundleId={bundle._id}
            modification={modification}
          />
          <StopLayer
            bundleId={bundle._id}
            modification={modification}
            selectedColor={colors.REMOVED}
          />
        </MiniMap>
      </Box>

      <Box textAlign='center'>
        <i>{message('report.removeStops.stopsRemoved')}</i>
      </Box>
      <List styleType='disc'>
        {modification.stops &&
          modification.stops
            .map((stopId) => stops.find((s) => s.id === stopId))
            .map((s) => <ListItem key={s.id}>{s.name}</ListItem>)}
      </List>

      {modification.secondsSavedAtEachStop > 0 && (
        <Box>
          {message('report.removeStops.secondsSaved', {
            secondsSaved: modification.secondsSavedAtEachStop
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
            <ListItem key={p.id}>{p.name}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
