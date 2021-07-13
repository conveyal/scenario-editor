import {Box, Heading, List, ListItem, Stack} from '@chakra-ui/react'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import useModificationRoute from 'lib/modification/hooks/use-modification-route'

import PatternLayer from '../modifications-map/pattern-layer'

import MiniMap from './mini-map'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'

/**
 * Removed trips
 */
export default function RemoveTrips({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.RemoveTrips
}) {
  const route = useModificationRoute(bundle, modification)
  const bounds = useModificationBounds(bundle, modification)
  const patterns = useModificationPatterns(bundle, modification)

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
            color={colors.REMOVED}
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
            {patterns.map((p) => (
              <ListItem key={p.id}>{p.name}</ListItem>
            ))}
          </List>
        </Stack>
      )}
    </Stack>
  )
}
