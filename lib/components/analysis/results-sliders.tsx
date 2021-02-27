import {
  Box,
  FormControl,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  FormControlProps
} from '@chakra-ui/react'
import {useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setMaxTripDurationMinutes,
  setTravelTimePercentile
} from 'lib/actions/analysis'
import useInput from 'lib/hooks/use-controlled-input'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import getNearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import {TRAVEL_TIME_PERCENTILES} from 'lib/constants'

export function CutoffSlider({isDisabled, ...p}) {
  const dispatch = useDispatch()
  const onChangeCutoff = useCallback(
    (cutoff) => dispatch(setMaxTripDurationMinutes(cutoff)),
    [dispatch]
  )
  const cutoffSlider = useInput({
    onChange: onChangeCutoff,
    value: useSelector(selectMaxTripDurationMinutes)
  })

  return (
    <FormControl isDisabled={isDisabled} {...p}>
      <Stack align='center' isInline spacing={5}>
        <FormLabel whiteSpace='nowrap' pb={0}>
          Time cutoff
        </FormLabel>
        <Slider
          isDisabled={isDisabled}
          min={1}
          max={120}
          onChange={cutoffSlider.onChange}
          value={cutoffSlider.value}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb
            aria-label='Time cutoff'
            ref={cutoffSlider.ref}
            boxSize='8'
          >
            <Box fontSize='sm' fontWeight='bold'>
              {cutoffSlider.value}
            </Box>
          </SliderThumb>
        </Slider>
        <FormLabel pb={0}>minute(s)</FormLabel>
      </Stack>
    </FormControl>
  )
}

type PercentileSliderProps = {
  isDisabled: boolean
}

export const PercentileSlider = memo<PercentileSliderProps & FormControlProps>(
  function PercentileSlider({isDisabled, ...p}) {
    const dispatch = useDispatch()
    const onChangePercentile = useCallback(
      (index) =>
        dispatch(setTravelTimePercentile(TRAVEL_TIME_PERCENTILES[index])),
      [dispatch]
    )
    const percentileSlider = useInput({
      onChange: onChangePercentile,
      value: getNearestPercentileIndex(useSelector(selectTravelTimePercentile))
    })

    return (
      <FormControl isDisabled={isDisabled} {...p}>
        <FormLabel>Travel time percentile</FormLabel>
        <Slider
          isDisabled={isDisabled}
          min={0}
          max={4}
          onChange={percentileSlider.onChange}
          value={percentileSlider.value}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb
            aria-label='Travel time percentile'
            ref={percentileSlider.ref}
            boxSize='8'
          >
            <Box fontSize='sm' fontWeight='bold'>
              {TRAVEL_TIME_PERCENTILES[percentileSlider.value]}
            </Box>
          </SliderThumb>
        </Slider>
      </FormControl>
    )
  }
)
