import {
  Box,
  BoxProps,
  FormControl,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  FormControlProps,
  VStack
} from '@chakra-ui/react'
import {useCallback, memo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setMaxTripDurationMinutes,
  setTravelTimePercentile
} from 'lib/actions/analysis'
import useInput from 'lib/hooks/use-controlled-input'
import OpportunityDatasetSelector from 'lib/modules/opportunity-datasets/components/selector'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import getNearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import {TRAVEL_TIME_PERCENTILES} from 'lib/constants'
import message from 'lib/message'

import InputWithUnits from '../input-with-units'

const filterFreeform = (dataset: CL.SpatialDataset) =>
  dataset.format !== 'FREEFORM'

export default function ResultSliders({isDisabled, isStale, regionId, ...p}) {
  const dispatch = useDispatch()
  const [cutoff, setCutoff] = useState<number>(
    useSelector(selectMaxTripDurationMinutes)
  )
  const onChangeCutoff = useCallback(
    (cutoff: number) => {
      if (cutoff >= 1 && cutoff <= 120) {
        dispatch(setMaxTripDurationMinutes(cutoff))
        setCutoff(cutoff)
      }
    },
    [dispatch]
  )
  const isDisabledOrStale = isDisabled || isStale
  return (
    <VStack spacing={5} width='100%' {...p}>
      <CutoffSlider
        cutoff={cutoff}
        isDisabled={isDisabledOrStale}
        onChange={onChangeCutoff}
      />
      <HStack spacing={6} width='100%'>
        <FormControl flex='1' isDisabled={isDisabledOrStale}>
          <FormLabel htmlFor={cutoffInputId} whiteSpace='nowrap'>
            Time cutoff
          </FormLabel>
          <InputWithUnits
            id={cutoffInputId}
            maxLength={3}
            onChange={(e) =>
              onChangeCutoff(parseInt(e.currentTarget.value, 10))
            }
            type='number'
            units='minutes'
            value={cutoff}
          />
        </FormControl>

        <PercentileSlider flex='1' isDisabled={isDisabledOrStale} />

        <FormControl flex='1' isDisabled={isDisabled}>
          <FormLabel htmlFor='select-opportunity-dataset'>
            {message('analysis.grid')}
          </FormLabel>
          <OpportunityDatasetSelector
            filter={filterFreeform}
            isDisabled={isDisabled}
            regionId={regionId}
          />
        </FormControl>
      </HStack>
    </VStack>
  )
}

type CutoffSliderProps = {
  cutoff: number
  isDisabled: boolean
  onChange: (cutoff: number) => void
}

const cutoffInputId = 'cutoff-slider'
const CutoffSlider = memo<Omit<BoxProps, 'onChange'> & CutoffSliderProps>(
  ({cutoff, isDisabled, onChange, ...p}) => {
    return (
      <Box pl='35px' pr='10px' width='100%' {...p}>
        <Slider
          isDisabled={isDisabled}
          min={1}
          max={120}
          onChange={onChange}
          value={cutoff}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb bg='blue.500' />
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
      <FormControl isDisabled={isDisabled} {...p}>
        <FormLabel id={percentileSlider.id}>Travel time percentile</FormLabel>
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
      </FormControl>
    )
  }
)
