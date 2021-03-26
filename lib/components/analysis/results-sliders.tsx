import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack
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
    <>
      <HStack width='100%' {...p}>
        <FormControl isDisabled={isDisabledOrStale} width='500px'>
          <CutoffSlider
            cutoff={cutoffInput.value}
            isDisabled={isDisabledOrStale}
            onChange={cutoffInput.onChange}
          />
          <FormLabel
            htmlFor={cutoffInput.id}
            textAlign='center'
            whiteSpace='nowrap'
          >
            Travel time cutoff minutes
          </FormLabel>
        </FormControl>
        <Box pl={5} width='95px'>
          <PercentileSlider isDisabled={isDisabledOrStale} />
        </Box>
      </HStack>
      <input
        style={{height: 0, width: 0}}
        id={cutoffInput.id}
        onChange={cutoffInput.onChange}
        value={cutoffInput.value}
      />
    </>
  )
}

type CutoffSliderProps = {
  cutoff: number
  isDisabled: boolean
  onChange: (cutoff: number) => void
}

const CutoffSlider = memo<CutoffSliderProps>(
  ({cutoff, isDisabled, onChange}) => {
    return (
      <Slider
        focusThumbOnChange={false}
        isDisabled={isDisabled}
        min={0}
        max={120}
        onChange={onChange}
        value={cutoff}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb
          boxSize='8'
          color='gray.900'
          fontSize='sm'
          fontWeight='bold'
          userSelect='none'
        >
          {cutoff}
        </SliderThumb>
      </Slider>
    )
  }
)

type PercentileSliderProps = {
  isDisabled: boolean
}

const PercentileSlider = memo<PercentileSliderProps>(function PercentileSlider({
  isDisabled
}) {
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
    <FormControl isDisabled={isDisabled}>
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
        <SliderThumb
          ref={percentileSlider.ref}
          boxSize='8'
          color='gray.900'
          fontSize='sm'
          fontWeight='bold'
          userSelect='none'
        >
          {TRAVEL_TIME_PERCENTILES[percentileSlider.value]}
        </SliderThumb>
      </Slider>
      <Flex alignItems='center' justify='center'>
        <FormLabel id={percentileSlider.id}>Percentile</FormLabel>
        <div>
          <DocsLink to='analysis/methodology#time-percentile' />
        </div>
      </Flex>
    </FormControl>
  )
})
