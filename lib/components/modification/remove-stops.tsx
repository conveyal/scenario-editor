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
  modification,
  selectedFeed,
  update,
  updateAndRetrieveFeedData
}) {
  function onPatternSelectorChange({feed, routes, trips}) {
    updateAndRetrieveFeedData({
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
        color={colors.NEUTRAL_LIGHT}
        feed={selectedFeed}
        modification={modification}
      />

      <StopLayer
        feed={selectedFeed}
        modification={modification}
        selectedColor={colors.REMOVED}
        unselectedColor={colors.NEUTRAL_LIGHT}
      />

      <SelectFeedRouteAndPatterns
        onChange={onPatternSelectorChange}
        routes={modification.routes}
        trips={modification.trips}
      />

      <NumberInput
        label={message('modification.removeStops.removeSeconds')}
        units={message('report.units.second')}
        onChange={changeRemoveSeconds}
        test={testSeconds}
        value={modification.secondsSavedAtEachStop}
      />

      {modification.routes && selectedFeed && (
        <Box>
          <SelectStops modification={modification} update={update} />
        </Box>
      )}
    </Stack>
  )
}
