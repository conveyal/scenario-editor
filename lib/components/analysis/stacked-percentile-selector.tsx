import {Box, Stack, Progress, StackProps} from '@chakra-ui/core'
import {color} from 'd3-color'
import {format} from 'd3-format'
import get from 'lodash/get'
import {memo} from 'react'
import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'

import selectDisplayedComparisonScenarioName from 'lib/selectors/displayed-comparison-scenario-name'
import selectDisplayedScenarioName from 'lib/selectors/displayed-scenario-name'
import selectAccessibility from 'lib/selectors/accessibility'
import selectComparisonAccessibility from 'lib/selectors/comparison-accessibility'
import selectComparisonPercentileCurves from 'lib/selectors/comparison-percentile-curves'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import selectPercentileCurves from 'lib/selectors/percentile-curves'
import selectMaxAccessibility from 'lib/selectors/max-accessibility'

import StackedPercentile, {
  StackedPercentileComparison
} from './stacked-percentile'

const GRAPH_HEIGHT = 225
const GRAPH_WIDTH = 600

const commaFormat = format(',d')

type Props = {
  disabled: boolean
  stale: boolean
}

// Use a memoized version by default
export default memo<Props & StackProps>(StackedPercentileSelector)

/**
 * A component allowing toggling between up to two stacked percentile plots and
 * comparisons of said
 */
function StackedPercentileSelector({disabled, stale, ...p}) {
  const projectName = useSelector(selectDisplayedScenarioName)
  const comparisonProjectName = useSelector(
    selectDisplayedComparisonScenarioName
  )
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const accessibility = useSelector(selectAccessibility)
  const comparisonAccessibility = useSelector(selectComparisonAccessibility)
  const comparisonPercentileCurves = useSelector(
    selectComparisonPercentileCurves
  )
  const isochroneCutoff = useSelector(selectMaxTripDurationMinutes)
  const percentileCurves = useSelector(selectPercentileCurves)
  const maxAccessibility = useSelector(selectMaxAccessibility)
  const opportunityDatasetName = opportunityDataset && opportunityDataset.name

  const projectColor =
    disabled || stale
      ? colors.STALE_PERCENTILE_COLOR
      : colors.PROJECT_PERCENTILE_COLOR
  const comparisonColor =
    disabled || stale
      ? colors.STALE_PERCENTILE_COLOR
      : colors.COMPARISON_PERCENTILE_COLOR

  const colorBar = color(projectColor)
  colorBar.opacity = 0.5
  const comparisonColorBar = color(comparisonColor)
  comparisonColorBar.opacity = 0.5

  return (
    <Stack {...p}>
      <Stack spacing={0}>
        <Stack isInline spacing={5} alignItems='center'>
          <Progress
            flex='10'
            color='blue'
            size='md'
            value={((accessibility || 1) / maxAccessibility) * 100}
          />
          <Box fontWeight='500' flex='1' textAlign='left'>
            {commaFormat(accessibility)}
          </Box>
        </Stack>

        {comparisonProjectName && comparisonAccessibility != null && (
          <Stack isInline spacing={5} alignItems='center'>
            <Progress
              flex='10'
              color='red'
              size='md'
              value={((comparisonAccessibility || 1) / maxAccessibility) * 100}
            />
            <Box fontWeight='500' flex='1' textAlign='left'>
              {commaFormat(comparisonAccessibility)}
            </Box>
          </Stack>
        )}
      </Stack>

      {get(percentileCurves, 'length') > 0 &&
        (comparisonPercentileCurves == null ? (
          <StackedPercentile
            cutoff={isochroneCutoff}
            percentileCurves={percentileCurves}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            opportunityDatasetName={opportunityDatasetName}
            color={projectColor}
            maxAccessibility={maxAccessibility}
          />
        ) : (
          <StackedPercentileComparison
            cutoff={isochroneCutoff}
            percentileCurves={percentileCurves}
            comparisonPercentileCurves={comparisonPercentileCurves}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            opportunityDatasetName={opportunityDatasetName}
            color={projectColor}
            comparisonColor={comparisonColor}
            maxAccessibility={maxAccessibility}
            label={projectName}
            comparisonLabel={comparisonProjectName}
          />
        ))}
    </Stack>
  )
}
