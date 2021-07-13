import {Box, Stack} from '@chakra-ui/react'
import {useCallback} from 'react'

import colors from 'lib/constants/colors'
import message from 'lib/message'

import NumberInput from '../number-input'
import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

const testSeconds = (s) => s >= 0

/**
 * Remove stops from a route
 */
export default function RemoveStopsComponent({
  bundle,
  modification,
  update
}: {
  bundle: CL.Bundle
  modification: CL.RemoveStops
  update: (updates: Partial<CL.RemoveStops>) => void
}) {
  function onPatternSelectorChange({feed, routes, trips}) {
    update({
      feed,
      routes,
      trips,
      stops: []
    })
  }

  const changeRemoveSeconds = useCallback(
    (secondsSavedAtEachStop) => {
      update({secondsSavedAtEachStop})
    },
    [update]
  )

  return (
    <Stack spacing={4} mb={4}>
      <PatternLayer
        activeTrips={modification.trips}
        bundleId={bundle._id}
        color={colors.NEUTRAL_LIGHT}
        modification={modification}
      />

      <StopLayer
        bundleId={bundle._id}
        modification={modification}
        selectedColor={colors.REMOVED}
        unselectedColor={colors.NEUTRAL_LIGHT}
      />

      <SelectFeedRouteAndPatterns
        bundle={bundle}
        modification={modification}
        onChange={onPatternSelectorChange}
      />

      <NumberInput
        label={message('modification.removeStops.removeSeconds')}
        units={message('report.units.second')}
        onChange={changeRemoveSeconds}
        test={testSeconds}
        value={modification.secondsSavedAtEachStop}
      />

      {modification.routes?.length === 1 && (
        <Box>
          <SelectStops
            bundleId={bundle._id}
            modification={modification}
            update={(stops) => update({stops})}
          />
        </Box>
      )}
    </Stack>
  )
}
