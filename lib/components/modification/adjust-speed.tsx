import {Alert, AlertIcon, Stack, Flex, Button, Box} from '@chakra-ui/react'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useCallback, useMemo, useState} from 'react'

import {
  ClearIcon,
  EditIcon,
  MinusSquare,
  PlusSquare
} from 'lib/components/icons'
import colors from 'lib/constants/colors'
import message from 'lib/message'
import intersects from 'lib/utils/arrays-intersect'

import Pane from '../map/pane'
import IconButton from '../icon-button'
import NumberInput from '../number-input'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'
import {useFeedStops, useRoutePatterns} from 'lib/gtfs/hooks'
import useHopStops from 'lib/modification/hooks/use-hop-stops'

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
  bundle,
  modification,
  update
}: {
  bundle: CL.Bundle
  modification: CL.AdjustSpeed
  update: (updates: Partial<CL.AdjustSpeed>) => void
}) {
  const selectedRouteId = get(modification, 'routes[0]')
  const allStops = useFeedStops(bundle._id, modification.feed)
  const routePatterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    selectedRouteId
  )
  const filteredPatterns = useMemo(() => {
    if (modification.trips?.length > 0) {
      return routePatterns.filter((p) =>
        intersects(p.associatedTripIds, modification.trips)
      )
    } else {
      return routePatterns
    }
  }, [routePatterns, modification.trips])
  const hopStops = useHopStops(bundle._id, modification)
  const [action, setAction] = useState<Action>('none')

  /**
   * Set the factor by which we are scaling, or the speed which we are
   * replacing.
   */
  const setScale = useCallback((scale: number) => update({scale}), [update])

  return (
    <Stack spacing={4} mb={4}>
      <GTFSStopGridLayer stops={allStops} />

      <Pane zIndex={500}>
        <PatternLayer
          activeTrips={modification.trips}
          bundleId={bundle._id}
          color={modification.hops == null ? colors.MODIFIED : colors.NEUTRAL}
          modification={modification}
        />
      </Pane>

      {modification.hops != null && (
        <Pane zIndex={501}>
          <HopLayer
            color={colors.MODIFIED}
            hops={modification.hops}
            patterns={filteredPatterns}
            stops={allStops}
          />
        </Pane>
      )}

      {action !== 'none' && (
        <HopSelectPolygon
          action={action}
          currentHops={modification.hops}
          hopStops={hopStops}
          update={(hops) => {
            update({hops})
            setAction('none')
          }}
        />
      )}

      <Box>
        <SelectFeedAndRoutes
          allowMultipleRoutes
          bundle={bundle}
          modification={modification}
          onChange={(feed, routes) => update({feed, routes, hops: null})}
        />
      </Box>

      {get(modification, 'routes.length') === 1 && (
        <Stack spacing={4}>
          <SelectPatterns
            patterns={routePatterns}
            onChange={(trips) => update({trips})}
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
              leftIcon={<EditIcon />}
              isFullWidth
              onClick={() => setAction('new')}
              colorScheme='blue'
            >
              {message('common.select')} segments
            </Button>
          ) : (
            <Flex justify='space-between'>
              <IconButton
                label={message('common.addTo')}
                onClick={() => setAction('add')}
                size='lg'
              >
                <PlusSquare />
              </IconButton>
              <IconButton
                label={message('common.removeFrom')}
                onClick={() => setAction('remove')}
                size='lg'
                colorScheme='yellow'
              >
                <MinusSquare />
              </IconButton>
              <IconButton
                label={message('common.clear')}
                onClick={() => {
                  setAction('none')
                  update({hops: null})
                }}
                size='lg'
                colorScheme='red'
              >
                <ClearIcon />
              </IconButton>
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
