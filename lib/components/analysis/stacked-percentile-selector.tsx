import {
  Box,
  FormControl,
  HStack,
  Stack,
  StackProps,
  useColorModeValue,
  useToken,
  VStack
} from '@chakra-ui/react'
import {format} from 'd3-format'
import get from 'lodash/get'
import {memo, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'

import selectAccessibility from 'lib/selectors/accessibility'
import selectComparisonAccessibility from 'lib/selectors/comparison-accessibility'
import selectComparisonPercentileCurves from 'lib/selectors/comparison-percentile-curves'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import selectPercentileIndex from 'lib/selectors/percentile-index'
import selectPercentileCurves from 'lib/selectors/percentile-curves'
import selectMaxAccessibility from 'lib/selectors/max-accessibility'
import OpportunityDatasetSelector from 'lib/modules/opportunity-datasets/components/selector'

import Tip from '../tip'

import StackedPercentile, {
  StackedPercentileComparison,
  SliceLine,
  createYScale,
  xScale,
  SVGWrapper
} from './stacked-percentile'

const PRIMARY_ACCESS_LABEL = 'Opportunities within isochrone'
const COMPARISON_ACCESS_LABEL = 'Opportunities within comparison isochrone'

const commaFormat = format(',d')

type Props = {
  disabled: boolean
  stale: boolean
  regionId: string
}

// Use a memoized version by default
export default memo<Props & StackProps>(StackedPercentileSelector)

const filterFreeform = (dataset: CL.SpatialDataset) =>
  dataset.format !== 'FREEFORM'

/**
 * A component allowing toggling between up to two stacked percentile plots and
 * comparisons of said
 */
function StackedPercentileSelector({disabled, stale, regionId, ...p}) {
  const fontColor = useColorModeValue('gray.900', 'white')
  const fontColorHex = useToken('colors', fontColor)
  const backgroundColor = useColorModeValue('white', 'gray.900')
  const backgroundColorHex = useToken('colors', backgroundColor)
  const accessibility = useSelector(selectAccessibility)
  const comparisonAccessibility = useSelector(selectComparisonAccessibility)
  const comparisonPercentileCurves = useSelector(
    selectComparisonPercentileCurves
  )
  const isochroneCutoff = useSelector(selectMaxTripDurationMinutes)
  const percentileIndex = useSelector(selectPercentileIndex)
  const percentileCurves = useSelector(selectPercentileCurves)
  const maxAccessibility = useSelector(selectMaxAccessibility)

  const [yScale, setYScale] = useState(() => createYScale(maxAccessibility))
  useEffect(() => {
    setYScale(() => createYScale(maxAccessibility))
  }, [maxAccessibility])

  const disabledOrStale = disabled || stale

  const projectColor = disabledOrStale
    ? colors.STALE_PERCENTILE_COLOR
    : colors.PROJECT_PERCENTILE_COLOR
  const comparisonColor = disabledOrStale
    ? colors.STALE_PERCENTILE_COLOR
    : colors.COMPARISON_PERCENTILE_COLOR

  const xPosition = xScale(isochroneCutoff)

  return (
    <Stack {...p} spacing={0}>
      <HStack mb={4} justify='space-between' spacing={8} width='100%'>
        <FormControl w='500px' isDisabled={disabled}>
          <OpportunityDatasetSelector
            filter={filterFreeform}
            regionId={regionId}
          />
        </FormControl>
        <VStack flex='1' fontFamily='mono' fontWeight='bold' spacing={0}>
          <Tip label={PRIMARY_ACCESS_LABEL}>
            <Box
              aria-label={PRIMARY_ACCESS_LABEL}
              borderWidth='1px'
              px={1}
              color={projectColor}
              roundedTop='md'
              roundedBottom={
                typeof comparisonAccessibility === 'number' ? 'none' : 'md'
              }
              textAlign='right'
              width='100%'
            >
              {typeof accessibility === 'number' ? (
                commaFormat(accessibility)
              ) : (
                <>&nbsp;</>
              )}
            </Box>
          </Tip>
          {typeof comparisonAccessibility === 'number' && (
            <Tip label={COMPARISON_ACCESS_LABEL}>
              <Box
                aria-label={COMPARISON_ACCESS_LABEL}
                color={comparisonColor}
                borderWidth='1px'
                borderTopWidth={0}
                px={1}
                roundedBottom='md'
                textAlign='right'
                width='100%'
              >
                {commaFormat(comparisonAccessibility)}
              </Box>
            </Tip>
          )}
        </VStack>
      </HStack>

      <Box fontFamily='mono'>
        {get(percentileCurves, 'length') > 0 &&
          (comparisonPercentileCurves == null ? (
            <SVGWrapper>
              <StackedPercentile
                backgroundColorHex={backgroundColorHex}
                fontColorHex={fontColorHex}
                percentileCurves={percentileCurves}
                percentileIndex={percentileIndex}
                color={projectColor}
                yScale={yScale}
              />
              <SliceLine color={fontColorHex} cutoff={isochroneCutoff} />
              <circle
                cx={xPosition}
                cy={yScale(percentileCurves[percentileIndex][isochroneCutoff])}
                style={{
                  stroke: projectColor,
                  strokeWidth: 1.5,
                  fill: 'none'
                }}
                r={3}
              />
            </SVGWrapper>
          ) : (
            <SVGWrapper>
              <StackedPercentileComparison
                backgroundColorHex={backgroundColorHex}
                fontColorHex={fontColorHex}
                percentileCurves={percentileCurves}
                percentileIndex={percentileIndex}
                comparisonPercentileCurves={comparisonPercentileCurves}
                color={projectColor}
                comparisonColor={comparisonColor}
                yScale={yScale}
              />
              <SliceLine color={fontColorHex} cutoff={isochroneCutoff} />
              <circle
                cx={xPosition}
                cy={yScale(percentileCurves[percentileIndex][isochroneCutoff])}
                style={{
                  stroke: projectColor,
                  strokeWidth: 1.5,
                  fill: 'none'
                }}
                r={4}
              />
              <Triangle
                color={comparisonColor}
                x={xPosition}
                y={yScale(
                  comparisonPercentileCurves[percentileIndex][isochroneCutoff]
                )}
              />
            </SVGWrapper>
          ))}
      </Box>
    </Stack>
  )
}

const tSize = 4
function Triangle({color, x, y}: {color: string; x: number; y: number}) {
  return (
    <polygon
      points={`${x - tSize},${y - tSize} ${x},${y + tSize} ${x + tSize},${
        y - tSize
      }`}
      style={{
        stroke: color,
        strokeWidth: 1.5,
        fill: 'none'
      }}
    />
  )
}
