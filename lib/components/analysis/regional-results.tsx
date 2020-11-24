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
import useOnMount from 'lib/hooks/use-on-mount'
import message from 'lib/message'
import {
  activeOpportunityDataset,
  opportunityDatasets as selectOpportunityDatasets
} from 'lib/modules/opportunity-datasets/selectors'
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

// Get full qualifier for opportunity datasets
const getFullODName = (od) => `${od?.sourceName}: ${od?.name}`

// Cannot pass `parseInt` directly because
const parseCutoff = (c) => parseInt(c)

function getNumberWithOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
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

function useComparisonAccessibilityLabel(comparisonAnalysis) {
  const comparisonPointSet = useSelector(selectComparisonPointSet)
  const comparisonCutoff = useSelector(selectComparisonCutoff)
  const comparisonPercentile = useSelector(selectComparisonPercentile)

  return comparisonAnalysis
    ? createAccessibilityLabel(
        comparisonAnalysis,
        get(comparisonPointSet, 'name'),
        comparisonCutoff,
        comparisonPercentile
      )
    : null
}

/**
 * Render a regional analysis results.
 */
export default function RegionalResults({analysis}) {
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

  // Load the grid on mount and when the settings are changed.
  useEffect(() => {
    dispatch(loadRegionalAnalysisGrid(analysis, cutoff, percentile, pointSetId))
  }, [analysis, cutoff, percentile, pointSetId, dispatch])

  const aggregationWeightName = get(opportunityDataset, 'name')

  const accessToLabel = createAccessibilityLabel(
    analysis,
    get(pointSet, 'name'),
    cutoff,
    percentile
  )
  const comparisonAccessToLabel = useComparisonAccessibilityLabel(
    comparisonAnalysis
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
        <ComparisonDisplay
          analysis={analysis}
          comparisonAnalysis={comparisonAnalysis}
        />
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

          <Box px={4}>
            <Heading size='xs'>{analysis.name}</Heading>
            <Text>{accessToLabel}</Text>
          </Box>
          {comparisonAnalysis && (
            <Box px={4}>
              <Text color='red.500'>
                <em>minus</em>
              </Text>
              <Heading size='xs'>{comparisonAnalysis.name}</Heading>
              <Text>{comparisonAccessToLabel}</Text>
            </Box>
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

function ComparisonDisplay({analysis, comparisonAnalysis}) {
  const dispatch = useDispatch()
  const opportunityDatasets = useSelector(selectOpportunityDatasets)
  const comparisonCutoff = useSelector(selectComparisonCutoff)
  const comparisonPercentile = useSelector(selectComparisonPercentile)
  const comparisonPointSet = useSelector(selectComparisonPointSet)

  const onChangeCutoff = useCallback(
    (v) => dispatch(setSearchParameter('comparisonCutoff', v)),
    [dispatch]
  )
  const comparisonCutoffInput = useControlledInput({
    onChange: onChangeCutoff,
    parse: parseCutoff,
    value: comparisonCutoff
  })

  const onChangePercentile = useCallback(
    (v) => dispatch(setSearchParameter('comparisonPercentile', v)),
    [dispatch]
  )
  const comparisonPercentileInput = useControlledInput({
    onChange: onChangePercentile,
    parse: parseCutoff,
    value: comparisonPercentile
  })

  const onChangeDestinationPointSet = useCallback(
    (v) => dispatch(setSearchParameter('comparisonDestinationPointSetId', v)),
    [dispatch]
  )
  const destinationPointSetInput = useControlledInput({
    onChange: onChangeDestinationPointSet,
    value: get(comparisonPointSet, '_id')
  })

  // Set the parameters on load to decouple them from the primary ones.
  useOnMount(() => {
    dispatch(setSearchParameter('comparisonCutoff', comparisonCutoff))
    dispatch(setSearchParameter('comparisonPercentile', comparisonPercentile))
    dispatch(
      setSearchParameter(
        'comparisonDestinationPointSetId',
        get(comparisonPointSet, '_id')
      )
    )
    return () => {
      dispatch(setSearchParameter('comparisonAnalysisId'))
      dispatch(setSearchParameter('comparisonCutoff'))
      dispatch(setSearchParameter('comparisonPercentile'))
      dispatch(setSearchParameter('comparisonDestinationPointSetId'))
    }
  })

  useEffect(() => {
    dispatch(
      loadRegionalAnalysisGrid(
        comparisonAnalysis,
        parseInt(comparisonCutoff),
        parseInt(comparisonPercentile),
        get(comparisonPointSet, '_id')
      )
    )
  }, [
    comparisonAnalysis,
    comparisonCutoff,
    comparisonPercentile,
    comparisonPointSet,
    dispatch
  ])

  return (
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
                {getFullODName(find(opportunityDatasets, ['_id', id]))}
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
  )
}
