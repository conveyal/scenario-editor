import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Stack
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'
import {useSelector} from 'react-redux'

import selectFeeds from 'lib/selectors/feeds-with-bundle-names'
import selectModificationBounds from 'lib/selectors/modification-bounds'
import selectRoutePatterns from 'lib/selectors/route-patterns'
import selectModificationFeed from 'lib/selectors/modification-feed'

import {AddIcon, MinusIcon} from '../icons'
import Select from '../select'

const getFeedLabel = fpGet('name')
const getFeedValue = fpGet('id')
const getRouteLabel = fpGet('label')
const getRouteValue = fpGet('route_id')

/**
 * Select routes without selecting patterns
 */
export default function SelectFeedAndRoutes({
  allowMultipleRoutes = false,
  onChange,
  selectedRouteIds,
  ...p
}) {
  // Zoom to bounds on a route change
  const feeds = useSelector(selectFeeds)
  const bounds = useSelector(selectModificationBounds)
  const routePatterns = useSelector(selectRoutePatterns)
  const selectedFeed = useSelector(selectModificationFeed)
  const [currentRoutePatterns, setCurrentRoutePatterns] = useState(
    routePatterns
  )
  const leaflet = useLeaflet()
  useEffect(() => {
    if (routePatterns !== currentRoutePatterns) {
      setCurrentRoutePatterns(routePatterns)
      if (bounds) {
        leaflet.map.fitBounds(bounds)
      }
    }
  }, [bounds, leaflet, currentRoutePatterns, routePatterns])

  function _selectFeed(feed) {
    onChange({feed: get(feed, 'id'), routes: null})
  }

  function _selectRoute(routes) {
    onChange({
      feed: get(selectedFeed, 'id'),
      routes: !routes
        ? []
        : Array.isArray(routes)
        ? routes.map((r) => (r ? r.route_id : ''))
        : [routes.route_id]
    })
  }

  function _deselectAllRoutes() {
    onChange({
      feed: get(selectedFeed, 'id'),
      routes: []
    })
  }

  function _selectAllRoutes() {
    if (selectedFeed) {
      onChange({
        feed: selectedFeed.id,
        routes: selectedFeed.routes.map((r) => r.route_id)
      })
    }
  }

  const routeIds = selectedRouteIds || []
  const selectedRoutes = routeIds.map((id) =>
    get(selectedFeed, 'routes', []).find((r) => r.route_id === id)
  )

  const multipleRoutesSelected = routeIds.length > 1
  const availableRoutes = get(selectedFeed, 'routes.length')
  const showSelectAllRoutes =
    allowMultipleRoutes && selectedFeed && routeIds.length < availableRoutes

  return (
    <Stack spacing={4} {...p}>
      <FormControl>
        <FormLabel htmlFor='Feed'>Select feed</FormLabel>
        <Select
          name='Feed'
          inputId='Feed'
          getOptionLabel={getFeedLabel}
          getOptionValue={getFeedValue}
          onChange={_selectFeed}
          options={feeds}
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
            isMulti={allowMultipleRoutes as any}
            onChange={_selectRoute}
            options={selectedFeed.routes}
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
