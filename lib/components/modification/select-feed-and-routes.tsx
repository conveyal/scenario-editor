import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Stack
} from '@chakra-ui/react'
import {get} from 'lodash'
import fpGet from 'lodash/fp/get'
import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'

import {useFeedRoutes, useRoutePatterns} from 'lib/gtfs/hooks'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'

import {AddIcon, MinusIcon} from '../icons'
import Select from '../select'

const getFeedLabel = fpGet('name')
const getFeedValue = fpGet('feedId')
const getRouteLabel = fpGet('name')
const getRouteValue = fpGet('id')

/**
 * Select routes without selecting patterns
 */
export default function SelectFeedAndRoutes({
  allowMultipleRoutes = false,
  bundle,
  modification,
  onChange
}: {
  allowMultipleRoutes?: boolean
  bundle: CL.Bundle
  modification: CL.FeedModification
  onChange: (feed: string, routes: string[]) => void
}) {
  const feedRoutes = useFeedRoutes(bundle._id, modification.feed)
  const selectedFeed = bundle.feeds.find((f) => f.feedId === modification.feed)

  // Zoom to bounds on a route change
  const bounds = useModificationBounds(bundle, modification as CL.Modification)
  const routePatterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    get(modification, 'routes[0]')
  )
  const [currentRoutePatterns, setCurrentRoutePatterns] =
    useState(routePatterns)
  const leaflet = useLeaflet()
  const newRoutePatterns = routePatterns !== currentRoutePatterns
  useEffect(() => {
    if (newRoutePatterns) {
      setCurrentRoutePatterns(routePatterns)
      if (bounds) {
        leaflet.map.fitBounds(bounds)
      }
    }
  }, [bounds, leaflet, newRoutePatterns, routePatterns])

  function _selectFeed(feed: CL.FeedSummary) {
    onChange(feed.feedId, [])
  }

  function _selectRoute(routes: GTFS.Route[] | GTFS.Route) {
    onChange(
      modification.feed,
      !routes
        ? []
        : Array.isArray(routes)
        ? routes.map((r) => (r ? r.id : ''))
        : [routes.id]
    )
  }

  function _deselectAllRoutes() {
    onChange(modification.feed, [])
  }

  function _selectAllRoutes() {
    if (modification.feed) {
      onChange(
        modification.feed,
        feedRoutes.map((r) => r.id)
      )
    }
  }

  const routeIds = modification.routes || []
  const selectedRoutes = routeIds.map((id) =>
    feedRoutes.find((r) => r.id === id)
  )

  const multipleRoutesSelected = routeIds.length > 1
  const showSelectAllRoutes =
    allowMultipleRoutes && selectedFeed && routeIds.length < feedRoutes.length

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel htmlFor='Feed'>Select feed</FormLabel>
        <Select
          name='Feed'
          inputId='Feed'
          getOptionLabel={getFeedLabel}
          getOptionValue={getFeedValue}
          onChange={_selectFeed}
          options={bundle.feeds}
          placeholder='Select feed'
          value={selectedFeed}
        />
      </FormControl>

      {selectedFeed && (
        <FormControl>
          <FormLabel htmlFor='Route'>Select route</FormLabel>
          <Select
            name='Route'
            inputId='Route'
            getOptionLabel={getRouteLabel}
            getOptionValue={getRouteValue}
            isMulti={allowMultipleRoutes}
            onChange={_selectRoute}
            options={feedRoutes}
            placeholder='Select route'
            value={allowMultipleRoutes ? selectedRoutes : selectedRoutes[0]}
          />
        </FormControl>
      )}

      {multipleRoutesSelected && (
        <Stack>
          <Alert status='warning'>
            <AlertIcon />
            This modification will apply to all routes selected. Select a single
            route to modify specific parts of that route.
          </Alert>
          <Button
            isFullWidth
            leftIcon={<MinusIcon />}
            onClick={_deselectAllRoutes}
            colorScheme='yellow'
          >
            Deselect all routes
          </Button>
        </Stack>
      )}

      {showSelectAllRoutes && (
        <Button
          isFullWidth
          leftIcon={<AddIcon />}
          onClick={_selectAllRoutes}
          colorScheme='blue'
        >
          Select all routes
        </Button>
      )}
    </Stack>
  )
}
