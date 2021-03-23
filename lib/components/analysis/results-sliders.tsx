import {
  Box,
  BoxProps,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  FormControlProps
} from '@chakra-ui/react'
import {useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import DocsLink from '../docs-link'

import {
  setMaxTripDurationMinutes,
  setTravelTimePercentile
} from 'lib/actions/analysis'
import useInput from 'lib/hooks/use-controlled-input'

import getNearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import {TRAVEL_TIME_PERCENTILES} from 'lib/constants'

const parseCutoff = (v) => parseInt(v, 10)
const cutoffIsValid = (v) => v && v >= 1 && v <= 120

export default function ResultSliders({
  defaultCutoff,
  isDisabled,
  isStale,
  ...p
}) {
  const dispatch = useDispatch()
  const onChangeCutoff = useCallback(
    (cutoff: number) => {
      if (cutoff >= 1 && cutoff <= 120) {
        dispatch(setMaxTripDurationMinutes(cutoff))
      }
    },
    [dispatch]
  )
  const cutoffInput = useInput({
    parse: parseCutoff,
    onChange: onChangeCutoff,
    test: cutoffIsValid,
    value: defaultCutoff
  })
  const isDisabledOrStale = isDisabled || isStale
  return (
    <HStack spacing={6} width='100%' {...p}>
      <FormControl alignContent={'top'} isDisabled={isDisabledOrStale}>
        <FormLabel htmlFor={cutoffInput.id} whiteSpace='nowrap'>
          Travel time: Cutoff (minutes)
        </FormLabel>
        <CutoffSlider
          cutoff={cutoffInput.value}
          isDisabled={isDisabledOrStale}
          onChange={onChangeCutoff}
        />
      </FormControl>
      <PercentileSlider
        flex='0 0 95px'
        alignItems={'top'}
        isDisabled={isDisabledOrStale}
      />
    </HStack>
  )
}

type CutoffSliderProps = {
  cutoff: number
  isDisabled: boolean
  onChange: (cutoff: number) => void
}

const CutoffSlider = memo<Omit<BoxProps, 'onChange'> & CutoffSliderProps>(
  ({cutoff, isDisabled, onChange, ...p}) => {
    return (
      <Box pl='4px' pr='2px' width='100%' {...p}>
        <Slider
          focusThumbOnChange={false}
          isDisabled={isDisabled}
          min={1}
          max={120}
          onChange={onChange}
          value={cutoff}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize='8'>
            <Box fontSize='sm' fontWeight='bold'>
              {cutoff}
            </Box>
          </SliderThumb>
        </Slider>
      </Box>
    )
  }
)

type PercentileSliderProps = {
  isDisabled: boolean
}

const PercentileSlider = memo<PercentileSliderProps & FormControlProps>(
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
      <FormControl pr='12px' pl='6px' isDisabled={isDisabled} {...p}>
        <Box width='100%' {...p}>
          <Flex justify='space-between'>
            <FormLabel id={percentileSlider.id}>Percentile</FormLabel>
            <div>
              <DocsLink to='analysis/methodology#time-percentile' />
            </div>
          </Flex>
          <Slider
            aria-labelledby={percentileSlider.id}
            isDisabled={isDisabled}
            min={0}
            max={4}
            onChange={percentileSlider.onChange}
            value={percentileSlider.value}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb ref={percentileSlider.ref} boxSize='8'>
              <Box fontSize='sm' fontWeight='bold'>
                {TRAVEL_TIME_PERCENTILES[percentileSlider.value]}
              </Box>
            </SliderThumb>
          </Slider>
        </Box>
      </FormControl>
    )
  }
)
