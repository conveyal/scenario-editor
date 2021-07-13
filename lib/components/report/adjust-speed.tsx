/** Report out an adjust-speed modification */
import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'

import {useRoutePatterns} from 'lib/gtfs/hooks'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'
import useModificationRoute from 'lib/modification/hooks/use-modification-route'

import AdjustSpeedLayer from '../modifications-map/adjust-speed-layer'

import MiniMap from './mini-map'

export default function AdjustSpeed({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.AdjustSpeed
}) {
  const bounds = useModificationBounds(bundle, modification)
  const patterns = useModificationPatterns(bundle, modification)
  const route = useModificationRoute(bundle, modification)
  const allRoutePatterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )
  if (patterns == null) return null

  const usesAllPatterns = patterns.length === allRoutePatterns.length

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}: {route.name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <AdjustSpeedLayer bundle={bundle} modification={modification} />
        </MiniMap>
      </Box>

      <Box>
        {message('report.adjustSpeed.scale', {scale: modification.scale})}
      </Box>

      <Box>
        <i>
          {message(
            'report.removeStops.' +
              (usesAllPatterns ? 'allPatterns' : 'somePatterns')
          )}
        </i>
      </Box>

      {!usesAllPatterns && (
        <List styleType='disc'>
          {patterns.map((p) => (
            <ListItem key={p.id}>{p.name}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
