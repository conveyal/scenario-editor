import {Box, Stack} from '@chakra-ui/react'
import get from 'lodash/get'

import {useRoutePatterns} from 'lib/gtfs/hooks'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'

/**
 * Select a (group of) patterns from the GTFS feed
 */
export default function SelectFeedRouteAndPatterns({
  allowMultipleRoutes = false,
  bundle,
  modification,
  onChange,
  ...p
}: {
  allowMultipleRoutes?: boolean
  bundle: CL.Bundle
  modification: CL.TripsModification
  onChange: (changes: Partial<CL.TripsModification>) => void
}) {
  function _selectTrips(trips: string[]) {
    onChange({trips})
  }

  function _selectFeedAndRoutes(feed: string, routes: string[]) {
    onChange({feed, routes, trips: null})
  }

  const routeId = get(modification, 'routes[0]')
  const patterns = useRoutePatterns(bundle._id, modification.feed, routeId)

  return (
    <Stack spacing={4} {...p}>
      <Box>
        <SelectFeedAndRoutes
          allowMultipleRoutes={allowMultipleRoutes}
          bundle={bundle}
          modification={modification}
          onChange={_selectFeedAndRoutes}
        />
      </Box>

      {modification.routes?.length === 1 && routeId && (
        <SelectPatterns
          onChange={_selectTrips}
          patterns={patterns}
          trips={modification.trips}
        />
      )}
    </Stack>
  )
}
