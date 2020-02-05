import {Select as ChakraSelect, Stack} from '@chakra-ui/core'
import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {loadRegionalAnalysisGrid} from 'lib/actions/analysis/regional'
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

import Select from '../select'
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
  const comparisonAnalysis = useSelector(selectComparisonAnalysis)
  const displayGrid = useSelector(selectDisplayGrid)
  const displayScale = useSelector(selectDisplayScale)
  const cutoff = useSelector(selectDisplayCutoff)
  const percentile = useSelector(selectDisplayPercentile)
  const comparisonCutoff = useSelector(selectComparisonCutoff)
  const comparisonPercentile = useSelector(selectComparisonPercentile)

  const activeId = p.analysis._id
  const [comparisonId, setComparisonId] = React.useState(
    get(comparisonAnalysis, '_id')
  )

  // Load the grids on mount and when they are changed.
  React.useEffect(() => {
    dispatch(loadRegionalAnalysisGrid(activeId, cutoff, percentile))
  }, [activeId, cutoff, percentile, dispatch])
  React.useEffect(() => {
    if (comparisonId)
      dispatch(
        loadRegionalAnalysisGrid(
          comparisonId,
          comparisonCutoff,
          comparisonPercentile
        )
      )
  }, [comparisonId, comparisonCutoff, comparisonPercentile, dispatch])

  function onChangeComparisonAnalysis(chosen) {
    const _id = get(chosen, '_id')
    // Local
    setComparisonId(_id)
    // In the store. Has heavy effects
    setImmediate(() =>
      dispatch(setSearchParameter('comparisonAnalysisId', _id))
    )
  }

  function onChangeCutoff(e) {
    dispatch(setSearchParameter('comparisonCutoff', e.target.value))
  }

  function onChangePercentile(e) {
    dispatch(setSearchParameter('comparisonPercentile', e.target.value))
  }

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

  return (
    <>
      <Group label={message('analysis.compareTo')}>
        <Select
          isClearable
          getOptionLabel={ra => ra.name}
          getOptionValue={ra => ra._id}
          onChange={onChangeComparisonAnalysis}
          options={comparisonAnalyses}
          value={comparisonAnalysis}
        />
      </Group>

      {comparisonAnalysis && (
        <>
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
          {p.analysis.workerVersion !== comparisonAnalysis.workerVersion && (
            <div className='alert alert-danger'>
              {message('r5Version.comparisonIsDifferent')}
            </div>
          )}

          <ProfileRequestDisplay
            {...comparisonAnalysis}
            {...comparisonAnalysis.request}
          />
        </>
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
    </>
  )
}
