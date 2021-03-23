import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  FormControlProps,
  SliderProps
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
const cutoffIsValid = (v) => v && v >= 0 && v <= 120

export default function ResultSliders({
  defaultCutoff,
  isDisabled,
  isStale,
  ...p
}) {
  const dispatch = useDispatch()
  const onChangeCutoff = useCallback(
    (cutoff: number) => {
      if (cutoff >= 0 && cutoff <= 120) {
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
      <FormControl isDisabled={isDisabledOrStale} width='500px'>
        <CutoffSlider
          cutoff={cutoffInput.value}
          isDisabled={isDisabledOrStale}
          onChange={onChangeCutoff}
        />
        <FormLabel
          htmlFor={cutoffInput.id}
          textAlign='center'
          whiteSpace='nowrap'
        >
          Travel time cutoff minutes
        </FormLabel>
      </FormControl>
      <PercentileSlider
        flex='0 0 95px'
        alignItems='top'
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

const CutoffSlider = memo<SliderProps & CutoffSliderProps>(
  ({cutoff, isDisabled, onChange, ...p}) => {
    return (
      <Slider
        focusThumbOnChange={false}
        isDisabled={isDisabled}
        min={0}
        max={120}
        onChange={onChange}
        value={cutoff}
        {...p}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb boxSize='8'>
          <Box color='gray.900' fontSize='sm' fontWeight='bold'>
            {cutoff}
          </Box>
        </SliderThumb>
      </Slider>
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
      <FormControl pl='6px' isDisabled={isDisabled} {...p}>
        <Box width='100%' {...p}>
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
              <Box color='gray.900' fontSize='sm' fontWeight='bold'>
                {TRAVEL_TIME_PERCENTILES[percentileSlider.value]}
              </Box>
            </SliderThumb>
          </Slider>
        </Box>
        <Flex alignItems='center' justify='center'>
          <FormLabel id={percentileSlider.id}>Percentile</FormLabel>
          <div>
            <DocsLink to='analysis/methodology#time-percentile' />
          </div>
        </Flex>
      </FormControl>
    )
  }
)
