import {
  Box,
  FormControl,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  FormHelperText,
  FormControlProps
} from '@chakra-ui/core'
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
        <FormLabel htmlFor={cutoffSlider.id} whiteSpace='nowrap' pb={0}>
          Time cutoff
        </FormLabel>
        <Slider {...cutoffSlider} isDisabled={isDisabled} min={1} max={120}>
          <SliderTrack />
          <SliderFilledTrack />
          <SliderThumb ref={cutoffSlider.ref} size='8'>
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
      (percentile) => dispatch(setTravelTimePercentile(percentile)),
      [dispatch]
    )
    const percentileSlider = useInput({
      onChange: onChangePercentile,
      value: useSelector(selectTravelTimePercentile)
    })

    // We only allow for a set of percentiles when viewing single point results
    const singlePointPercentile =
      TRAVEL_TIME_PERCENTILES[getNearestPercentileIndex(percentileSlider.value)]
    return (
      <FormControl isDisabled={isDisabled} {...p}>
        <FormLabel htmlFor={percentileSlider.id}>
          Travel time percentile
        </FormLabel>
        <Slider {...percentileSlider} isDisabled={isDisabled} min={1} max={99}>
          <SliderTrack />
          <SliderFilledTrack />
          <SliderThumb ref={percentileSlider.ref} size='8'>
            <Box fontSize='sm' fontWeight='bold'>
              {percentileSlider.value}
            </Box>
          </SliderThumb>
        </Slider>
        <FormHelperText>
          {singlePointPercentile} single-point, {percentileSlider.value}{' '}
          multi-point
        </FormHelperText>
      </FormControl>
    )
  }
)
