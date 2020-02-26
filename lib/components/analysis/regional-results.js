import {
  Alert,
  AlertIcon,
  Box,
  Select as ChakraSelect,
  Stack
} from '@chakra-ui/core'
import {faDownload} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import fetchAction from 'lib/actions/fetch'
import {loadRegionalAnalysisGrid} from 'lib/actions/analysis/regional'
import {API} from 'lib/constants'
import useControlledInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectAggregateAccessibility from 'lib/selectors/aggregate-accessibility'
import selectComparisonAA from 'lib/selectors/comparison-aggregate-accessibility'
import selectComparisonAnalyses from 'lib/selectors/comparison-analyses'
import selectComparisonAnalysis from 'lib/selectors/comparison-regional-analysis'
import selectComparisonCutoff from 'lib/selectors/regional-comparison-cutoff'
import selectComparisonPercentile from 'lib/selectors/regional-comparison-percentile'
import selectDisplayCutoff from 'lib/selectors/regional-display-cutoff'
import selectDisplayGrid from 'lib/selectors/regional-display-grid'
import selectDisplayPercentile from 'lib/selectors/regional-display-percentile'
import selectDisplayScale from 'lib/selectors/regional-display-scale'

import {Button} from '../buttons'
import Select from '../select'
import Icon from '../icon'
import {Group} from '../input'
import P from '../p'

import ProfileRequestDisplay from './profile-request-display'
import Legend from './legend'
import AggregationArea from './aggregation-area'
import AggregateAccessibility from './aggregate-accessibility'

function createAccessibilityLabel(analysis, gridName, cutoff, percentile) {
  if (!analysis) return
  if (Array.isArray(analysis.travelTimePercentiles)) {
    return message('analysis.accessTo', {
      opportunity: gridName,
      cutoff,
      percentile
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
    percentile: analysis.travelTimePercentile
  })
}

/**
 * Render a regional analysis results.
 */
export default function RegionalResults(p) {
  const dispatch = useDispatch()

  const opportunityDataset = useSelector(activeOpportunityDataset)
  const aggregateAccessibility = useSelector(selectAggregateAccessibility)
  const comparisonAggregateAccessibility = useSelector(selectComparisonAA)
  const comparisonAnalyses = useSelector(selectComparisonAnalyses)
  const displayGrid = useSelector(selectDisplayGrid)
  const displayScale = useSelector(selectDisplayScale)
  const cutoff = useSelector(selectDisplayCutoff)
  const percentile = useSelector(selectDisplayPercentile)

  const [
    comparisonAnalysis,
    onChangeComparisonAnalysis
  ] = useControlledInput(useSelector(selectComparisonAnalysis), v =>
    dispatch(setSearchParameter('comparisonAnalysisId', get(v, '_id')))
  )
  const [comparisonCutoff, onChangeCutoff] = useControlledInput(
    useSelector(selectComparisonCutoff),
    v => dispatch(setSearchParameter('comparisonCutoff', v))
  )
  const [
    comparisonPercentile,
    onChangePercentile
  ] = useControlledInput(useSelector(selectComparisonPercentile), v =>
    dispatch(setSearchParameter('comparisonPercentile', v))
  )

  // Load the grids on mount and when they are changed.
  React.useEffect(() => {
    dispatch(loadRegionalAnalysisGrid(p.analysis, cutoff, percentile))
  }, [p.analysis, cutoff, percentile, dispatch])
  React.useEffect(() => {
    if (comparisonAnalysis) {
      dispatch(
        loadRegionalAnalysisGrid(
          comparisonAnalysis,
          comparisonCutoff,
          comparisonPercentile
        )
      )
    }
  }, [comparisonAnalysis, comparisonCutoff, comparisonPercentile, dispatch])

  function findName(_id) {
    const value = p.opportunityDatasets.find(i => i._id === _id)
    return get(value, 'name', _id)
  }

  const gridName = findName(p.analysis.grid)
  const comparisonGridName = findName(get(comparisonAnalysis, 'grid'))
  const aggregationWeightName = get(opportunityDataset, 'name')

  const accessToLabel = createAccessibilityLabel(
    p.analysis,
    gridName,
    cutoff,
    percentile
  )
  const comparisonAccessToLabel = createAccessibilityLabel(
    comparisonAnalysis,
    comparisonGridName,
    comparisonCutoff,
    comparisonPercentile
  )

  /**
   * Perform an authenticated fetch to get a presigned URL to download a grid
   * from S3, then download it. Pass in the path to fetch.
   */
  function _downloadProjectGIS(e) {
    e.preventDefault()
    dispatch(
      fetchAction({
        url: `${API.Regional}/${p.analysis._id}/grid/tiff?cutoff=${cutoff}&percentile=${percentile}`
      })
    ).then(value => {
      window.open(value.url)
    })
  }

  return (
    <Stack spacing={4}>
      <Box>
        <label className='control-label'>{message('analysis.gisExport')}</label>
        <Button block onClick={_downloadProjectGIS} size='sm' style='info'>
          <Icon icon={faDownload} />{' '}
          {message('analysis.downloadRegional', {
            name: p.analysis.name
          })}
        </Button>
      </Box>

      <Box>
        <label className='control-label'>{message('analysis.compareTo')}</label>
        <Select
          isClearable
          getOptionLabel={ra => ra.name}
          getOptionValue={ra => ra._id}
          onChange={onChangeComparisonAnalysis}
          options={comparisonAnalyses}
          value={comparisonAnalysis}
        />
      </Box>

      {comparisonAnalysis && (
        <Stack spacing={4}>
          {p.analysis.workerVersion !== comparisonAnalysis.workerVersion && (
            <Alert status='danger'>
              <AlertIcon />
              {message('r5Version.comparisonIsDifferent')}
            </Alert>
          )}

          <Box>
            <ProfileRequestDisplay
              {...comparisonAnalysis}
              {...comparisonAnalysis.request}
            />
          </Box>

          <Stack spacing={4} mb={4}>
            {Array.isArray(comparisonAnalysis.cutoffsMinutes) && (
              <ChakraSelect onChange={onChangeCutoff} value={comparisonCutoff}>
                {comparisonAnalysis.cutoffsMinutes.map(m => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </ChakraSelect>
            )}
            {Array.isArray(comparisonAnalysis.travelTimePercentiles) && (
              <ChakraSelect
                onChange={onChangePercentile}
                value={comparisonPercentile}
              >
                {comparisonAnalysis.travelTimePercentiles.map(p => (
                  <option key={p} value={p}>
                    {p}th percentile
                  </option>
                ))}
              </ChakraSelect>
            )}
          </Stack>
        </Stack>
      )}

      <Group label='Access to'>
        <P>{accessToLabel}</P>

        {comparisonAnalysis && <P>minus {comparisonAccessToLabel}</P>}

        {displayGrid && displayScale ? (
          <Legend
            breaks={displayScale.breaks}
            min={displayGrid.min}
            colors={displayScale.colorRange}
          />
        ) : (
          <P>Loading grids...</P>
        )}
      </Group>

      <AggregationArea regionId={p.regionId} />

      {p.analysis && aggregateAccessibility && aggregationWeightName && (
        <AggregateAccessibility
          aggregateAccessibility={aggregateAccessibility}
          comparisonAggregateAccessibility={comparisonAggregateAccessibility}
          weightByName={aggregationWeightName}
          accessToName={gridName}
          regionalAnalysisName={p.analysis.name}
          comparisonAccessToName={comparisonAnalysis ? comparisonGridName : ''}
          comparisonRegionalAnalysisName={get(comparisonAnalysis, 'name')}
        />
      )}
    </Stack>
  )
}
