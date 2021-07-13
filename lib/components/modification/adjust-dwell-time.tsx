import {Box, Radio, RadioGroup, Stack} from '@chakra-ui/react'

import colors from 'lib/constants/colors'

import NumberInput from '../number-input'
import PatternLayer from '../modifications-map/pattern-layer'
import StopLayer from '../modifications-map/stop-layer'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

// Must be non-negative
const testDwellTime = (s: number) => s >= 0

/**
 * Change dwell times
 */
export default function AdjustDwellTimeComponent(p: {
  bundle: CL.Bundle
  modification: CL.AdjustDwellTime
  update: (updates: Partial<CL.AdjustDwellTime>) => void
}) {
  function _onPatternSelectorChange({feed, routes, trips}) {
    p.update({feed, routes, trips, stops: null})
  }

  // Set the factor by which we are scaling, or the speed which we are replacing.
  function _setValue(value: number) {
    p.update({value})
  }

  return (
    <Stack spacing={4}>
      <PatternLayer
        activeTrips={p.modification.trips}
        bundleId={p.bundle._id}
        color={colors.NEUTRAL_LIGHT}
        modification={p.modification}
      />
      <StopLayer
        bundleId={p.bundle._id}
        modification={p.modification}
        nullIsWildcard
        selectedColor={colors.MODIFIED}
      />

      <SelectFeedRouteAndPatterns
        bundle={p.bundle}
        modification={p.modification}
        onChange={_onPatternSelectorChange}
      />

      {p.modification.routes && (
        <Box>
          <SelectStops
            bundleId={p.bundle._id}
            modification={p.modification}
            update={(stops) => p.update({stops})}
          />
        </Box>
      )}

      <RadioGroup
        onChange={(newValue) => {
          p.update({
            scale: newValue === 'scale'
          })
        }}
        value={p.modification.scale === true ? 'scale' : 'speed'}
      >
        <Radio id='adjust-dwell-time-scale' fontWeight='normal' value='scale'>
          Scale existing dwell times by
        </Radio>
        <Radio id='adjust-dwell-time-speed' fontWeight='normal' value='speed'>
          Set new dwell time to
        </Radio>
      </RadioGroup>

      <NumberInput
        test={testDwellTime}
        onChange={_setValue}
        units={p.modification.scale ? ' ' : 'seconds'}
        value={p.modification.value}
      />
    </Stack>
  )
}
