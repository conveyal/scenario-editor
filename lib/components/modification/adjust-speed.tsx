import {Alert, AlertIcon, Stack, Flex, Button} from '@chakra-ui/core'
import {
  faPlusSquare,
  faMinusSquare,
  faBan
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useCallback, useState} from 'react'
import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import selectHopStops from 'lib/selectors/hop-stops'
import selectModificationFeed from 'lib/selectors/modification-feed'
import selectStopsFromAllFeeds from 'lib/selectors/stops-from-all-feeds'

import IconButton from '../icon-button'
import NumberInput from '../number-input'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'

const GTFSStopGridLayer = dynamic(
  () => import('../modifications-map/gtfs-stop-gridlayer'),
  {ssr: false}
)
const HopLayer = dynamic(() => import('../modifications-map/hop-layer'), {
  ssr: false
})
const HopSelectPolygon = dynamic(
  () => import('../modifications-map/hop-select-polygon'),
  {ssr: false}
)
const PatternLayer = dynamic(
  () => import('../modifications-map/pattern-layer'),
  {ssr: false}
)

// Test for valid speed value
const testSpeed = (s) => s >= 0

// Map actions
type Action = 'none' | 'new' | 'add' | 'remove'

/**
 * Adjust speed on a route
 */
export default function AdjustSpeedComponent({
  modification,
  update,
  updateAndRetrieveFeedData
}) {
  const allStops = useSelector(selectStopsFromAllFeeds)
  const feed = useSelector(selectModificationFeed)
  const hopStops = useSelector(selectHopStops)
  const [action, setAction] = useState<Action>('none')

  /**
   * Set the factor by which we are scaling, or the speed which we are
   * replacing.
   */
  const setScale = useCallback((scale) => update({scale}), [update])

  return (
    <Stack spacing={4} mb={4}>
      <GTFSStopGridLayer stops={allStops} />

      <PatternLayer
        activeTrips={modification.trips}
        color={modification.hops == null ? colors.MODIFIED : colors.NEUTRAL}
        feed={feed}
        modification={modification}
      />

      {modification.hops != null && (
        <HopLayer
          color={colors.MODIFIED}
          feed={feed}
          hopStops={hopStops}
          modification={modification}
        />
      )}

      {action !== 'none' && (
        <HopSelectPolygon
          action={action}
          allStops={allStops}
          currentHops={modification.hops}
          hopStops={hopStops}
          update={(hops) => {
            update({hops})
            setAction('none')
          }}
        />
      )}

      <SelectFeedAndRoutes
        allowMultipleRoutes
        onChange={({feed, routes, trips}) =>
          updateAndRetrieveFeedData({feed, routes, trips, hops: null})
        }
        selectedRouteIds={modification.routes}
      />

      {get(modification, 'routes.length') === 1 && (
        <Stack spacing={4}>
          <SelectPatterns
            onChange={(trips) => updateAndRetrieveFeedData({trips})}
            trips={modification.trips}
          />

          <Alert status='info'>
            <AlertIcon />
            {message(
              `report.adjustSpeed.${
                modification.hops == null
                  ? 'noHopsInstructions'
                  : 'selectInstructions'
              }`
            )}
          </Alert>

          {modification.hops == null ? (
            <Button
              leftIcon='edit'
              isFullWidth
              onClick={() => setAction('new')}
              variantColor='blue'
            >
              {message('common.select')} segments
            </Button>
          ) : (
            <Flex justify='space-between'>
              <IconButton
                icon={faPlusSquare}
                label={message('common.addTo')}
                onClick={() => setAction('add')}
                size='lg'
              />
              <IconButton
                icon={faMinusSquare}
                label={message('common.removeFrom')}
                onClick={() => setAction('remove')}
                size='lg'
                variantColor='yellow'
              />
              <IconButton
                icon={faBan}
                label={message('common.clear')}
                onClick={() => {
                  setAction('none')
                  update({hops: null})
                }}
                size='lg'
                variantColor='red'
              />
            </Flex>
          )}
        </Stack>
      )}

      <NumberInput
        label={message('report.adjustSpeed.scaleLabel')}
        onChange={setScale}
        test={testSpeed}
        value={modification.scale}
      />
    </Stack>
  )
}
