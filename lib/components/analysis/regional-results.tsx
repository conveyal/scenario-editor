import {
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Select as ChakraSelect,
  Stack,
  Text
} from '@chakra-ui/core'
import {faTh} from '@fortawesome/free-solid-svg-icons'
import find from 'lodash/find'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import omit from 'lodash/omit'
import {useCallback, useEffect} from 'react'
import MapControl from 'react-leaflet-control'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {loadRegionalAnalysisGrid} from 'lib/actions/analysis/regional'
import useControlledInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectAggregateAccessibility from 'lib/selectors/aggregate-accessibility'
import selectComparisonAA from 'lib/selectors/comparison-aggregate-accessibility'
import selectComparisonAnalyses from 'lib/selectors/comparison-analyses'
import selectComparisonAnalysis from 'lib/selectors/comparison-regional-analysis'
import selectComparisonCutoff from 'lib/selectors/regional-comparison-cutoff'
import selectComparisonPercentile from 'lib/selectors/regional-comparison-percentile'
import selectComparisonPointSet from 'lib/selectors/regional-comparison-destination-pointset'
import selectDisplayCutoff from 'lib/selectors/regional-display-cutoff'
import selectDisplayGrid from 'lib/selectors/regional-display-grid'
import selectDisplayPercentile from 'lib/selectors/regional-display-percentile'
import selectPointSet from 'lib/selectors/regional-display-destination-pointset'
import selectDisplayScale from 'lib/selectors/regional-display-scale'

import Icon from '../icon'
import Select from '../select'

import ProfileRequestDisplay from './profile-request-display'
import Legend from './legend'
import AggregationArea from './aggregation-area'
import AggregateAccessibility from './aggregate-accessibility'

// For react-select props
const getName = fpGet('name')
const getId = fpGet('_id')

function getNumberWithOrdinal(n) {
  var s = ['th', 'st', 'nd', 'rd'],
    v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function createAccessibilityLabel(analysis, gridName, cutoff, percentile) {
  if (!analysis) return
  if (Array.isArray(analysis.travelTimePercentiles)) {
    return message('analysis.accessTo', {
      opportunity: gridName,
      cutoff,
      percentile: getNumberWithOrdinal(percentile)
    })
  }
  if (analysis.travelTimePercentile === -1) {
    return message('analysis.accessToInstantaneous', {
      opportunity: gridName,
      cutoff: analysis.cutoffMinutes
    })
  }
  return message('analysis.accessTo', {
    opportunity: gridName,
    cutoff: analysis.cutoffMinutes,
    percentile: getNumberWithOrdinal(analysis.travelTimePercentile)
  })
}

/**
 * Render a regional analysis results.
 */
export default function RegionalResults({analysis, opportunityDatasets}) {
  const dispatch = useDispatch()

  const opportunityDataset = useSelector(activeOpportunityDataset)
  const aggregateAccessibility = useSelector(selectAggregateAccessibility)
  const comparisonAggregateAccessibility = useSelector(selectComparisonAA)
  const comparisonAnalyses = useSelector(selectComparisonAnalyses)
  const comparisonPointSet = useSelector(selectComparisonPointSet)
  const displayGrid = useSelector(selectDisplayGrid)
  const displayScale = useSelector(selectDisplayScale)
  const cutoff = useSelector(selectDisplayCutoff)
  const percentile = useSelector(selectDisplayPercentile)
  const pointSet = useSelector(selectPointSet)

  // For easier comparison later
  const comparisonPointSetId = get(comparisonPointSet, '_id')
  const pointSetId = get(pointSet, '_id')

  const onChangeComparisonAnalysis = useCallback(
    (v) => dispatch(setSearchParameter('comparisonAnalysisId', get(v, '_id'))),
    [dispatch]
  )
  const comparisonAnalysisInput = useControlledInput({
    onChange: onChangeComparisonAnalysis,
    value: useSelector(selectComparisonAnalysis)
  })
  const comparisonAnalysis = comparisonAnalysisInput.value

  const onChangeCutoff = useCallback(
    (v) => dispatch(setSearchParameter('comparisonCutoff', v)),
    [dispatch]
  )
  const comparisonCutoffInput = useControlledInput({
    onChange: onChangeCutoff,
    value: useSelector(selectComparisonCutoff)
  })
  const comparisonCutoff = comparisonCutoffInput.value

  const onChangePercentile = useCallback(
    (v) => dispatch(setSearchParameter('comparisonPercentile', v)),
    [dispatch]
  )
  const comparisonPercentileInput = useControlledInput({
    onChange: onChangePercentile,
    value: useSelector(selectComparisonPercentile)
  })
  const comparisonPercentile = comparisonPercentileInput.value

  const onChangeDestinationPointSet = useCallback(
    (v) => dispatch(setSearchParameter('comparisonDestinationPointSetId', v)),
    [dispatch]
  )
  const destinationPointSetInput = useControlledInput({
    onChange: onChangeDestinationPointSet,
    value: get(comparisonPointSet, '_id')
  })

  // Load the grids on mount and when they are changed.
  useEffect(() => {
    dispatch(loadRegionalAnalysisGrid(analysis, cutoff, percentile, pointSetId))
  }, [analysis, cutoff, percentile, pointSetId, dispatch])
  useEffect(() => {
    if (comparisonAnalysis) {
      dispatch(
        loadRegionalAnalysisGrid(
          comparisonAnalysis,
          comparisonCutoff,
          comparisonPercentile,
          comparisonPointSetId
        )
      )
    }
  }, [
    comparisonAnalysis,
    comparisonCutoff,
    comparisonPercentile,
    comparisonPointSetId,
    dispatch
  ])

  const aggregationWeightName = get(opportunityDataset, 'name')

  const accessToLabel = createAccessibilityLabel(
    analysis,
    get(pointSet, 'name'),
    cutoff,
    percentile
  )
  const comparisonAccessToLabel = createAccessibilityLabel(
    comparisonAnalysis,
    get(comparisonPointSet, 'name'),
    comparisonCutoff,
    comparisonPercentile
  )

  return (
    <Stack spacing={4} py={4}>
      <FormControl px={4}>
        <FormLabel htmlFor={comparisonAnalysisInput.id}>
          {message('analysis.compareTo')}
        </FormLabel>
        <Select
          inputId={comparisonAnalysisInput.id}
          isClearable
          getOptionLabel={getName}
          getOptionValue={getId}
          onChange={comparisonAnalysisInput.onChange}
          options={comparisonAnalyses}
          value={comparisonAnalysis}
        />
      </FormControl>

      {comparisonAnalysis && (
        <>
          <Stack spacing={4} px={4} pb={4}>
            {analysis.workerVersion !== comparisonAnalysis.workerVersion && (
              <Alert status='error'>
                <AlertIcon />
                {message('r5Version.comparisonIsDifferent')}
              </Alert>
            )}

            {Array.isArray(comparisonAnalysis.destinationPointSetIds) && (
              <ChakraSelect {...destinationPointSetInput}>
                {comparisonAnalysis.destinationPointSetIds.map((id) => (
                  <option key={id} value={id}>
                    {get(find(opportunityDatasets, ['_id', id]), 'name')}
                  </option>
                ))}
              </ChakraSelect>
            )}

            <Stack isInline>
              {Array.isArray(comparisonAnalysis.cutoffsMinutes) && (
                <ChakraSelect {...comparisonCutoffInput}>
                  {comparisonAnalysis.cutoffsMinutes.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </ChakraSelect>
              )}
              {Array.isArray(comparisonAnalysis.travelTimePercentiles) && (
                <ChakraSelect {...comparisonPercentileInput}>
                  {comparisonAnalysis.travelTimePercentiles.map((p) => (
                    <option key={p} value={p}>
                      {p}th percentile
                    </option>
                  ))}
                </ChakraSelect>
              )}
            </Stack>
          </Stack>

          <ProfileRequestDisplay
            bundleId={comparisonAnalysis.bundleId}
            color='red'
            profileRequest={{
              ...omit(comparisonAnalysis, 'request'),
              ...comparisonAnalysis.request
            }}
            projectId={comparisonAnalysis.projectId}
          />
        </>
      )}

      <MapControl position='bottomleft'>
        <Stack
          backgroundColor='white'
          boxShadow='lg'
          rounded='md'
          spacing={3}
          width='296px'
        >
          <Heading pt={4} px={4} size='sm'>
            <Icon icon={faTh} /> Access to
          </Heading>

          <Text px={4}>{accessToLabel}</Text>
          {comparisonAnalysis && (
            <Text px={4}>
              <em>minus</em> {comparisonAccessToLabel}
            </Text>
          )}

          {displayGrid && displayScale ? (
            displayScale.breaks.length > 0 ? (
              <Legend
                breaks={displayScale.breaks}
                min={displayGrid.min}
                colors={displayScale.colorRange}
              />
            ) : (
              <Alert roundedBottom='md' status='warning'>
                <AlertIcon />
                There is no data to show.
              </Alert>
            )
          ) : (
            <Text p={4}>Loading grids...</Text>
          )}
        </Stack>
      </MapControl>

      <Box p={4}>
        <AggregationArea regionId={analysis.regionId} />
      </Box>

      {analysis && aggregateAccessibility && aggregationWeightName && (
        <Box px={4}>
          <AggregateAccessibility
            aggregateAccessibility={aggregateAccessibility}
            comparisonAggregateAccessibility={comparisonAggregateAccessibility}
            weightByName={aggregationWeightName}
            accessToName={pointSet.name}
            regionalAnalysisName={analysis.name}
            comparisonAccessToName={
              comparisonAnalysis ? get(comparisonPointSet, 'name') : ''
            }
            comparisonRegionalAnalysisName={get(comparisonAnalysis, 'name')}
          />
        </Box>
      )}
    </Stack>
  )
}
