import {Stack} from '@chakra-ui/react'
import get from 'lodash/get'
import React from 'react'
import {useSelector} from 'react-redux'

import selectFeeds from 'lib/selectors/feeds-with-bundle-names'
import selectModificationFeed from 'lib/selectors/modification-feed'
import selectRoutePatterns from 'lib/selectors/route-patterns'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'

/**
 * Select a (group of) patterns from the GTFS feed
 */
export default function SelectFeedRouteAndPatterns({
  allowMultipleRoutes = false,
  onChange,
  routes,
  trips,
  ...p
}) {
  const feeds = useSelector(selectFeeds)
  const routePatterns = useSelector(selectRoutePatterns)
  const selectedFeed = useSelector(selectModificationFeed)

  function _selectTrips(trips) {
    onChange({
      feed: get(selectedFeed, 'id'),
      routes,
      trips
    })
  }

  function _selectFeedAndRoutes({feed, routes}) {
    onChange({feed, routes, trips: null})
  }

  return (
    <Stack spacing={4} {...p}>
      <SelectFeedAndRoutes
        allowMultipleRoutes={allowMultipleRoutes}
        feeds={feeds}
        onChange={_selectFeedAndRoutes}
        selectedFeed={selectedFeed}
        selectedRouteIds={routes}
      />

      {get(routes, 'length') < 2 && routePatterns.length > 0 && (
        <SelectPatterns onChange={_selectTrips} trips={trips} />
      )}
    </Stack>
  )
}
