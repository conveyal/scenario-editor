import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  loadRegionalAnalysisGrids,
  setActiveRegionalAnalyses
} from 'lib/actions/analysis/regional'
import colors from 'lib/constants/colors'
import useOnMount from 'lib/hooks/use-on-mount'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectAggregateAccessibility from 'lib/selectors/aggregate-accessibility'
import selectComparisonAA from 'lib/selectors/comparison-aggregate-accessibility'
import selectComparisonAnalyses from 'lib/selectors/comparison-analyses'
import selectComparisonAnalysis from 'lib/selectors/comparison-regional-analysis'

import Select from '../select'
import {Group} from '../input'
import P from '../p'

import ProfileRequestDisplay from './profile-request-display'
import Legend from './legend'
import AggregationArea from './aggregation-area'
import AggregateAccessibility from './aggregate-accessibility'

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

  useOnMount(() => {
    dispatch(loadRegionalAnalysisGrids({_id: p.analysisId}))
  })

  function onChangeComparisonAnalysis(chosen) {
    const ids = {_id: p.analysisId, comparisonId: undefined}
    if (chosen != null) ids.comparisonId = chosen._id

    dispatch(setActiveRegionalAnalyses(ids))
    dispatch(loadRegionalAnalysisGrids(ids))
  }

  function findName(_id) {
    const value = p.opportunityDatasets.find(i => i._id === _id)
    return get(value, 'name', _id)
  }

  const gridName = findName(p.analysis.grid)
  const comparisonGridName = findName(get(comparisonAnalysis, 'grid'))
  const aggregationWeightName = get(opportunityDataset, 'name')

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
        <P>
          {p.analysis.travelTimePercentile !== -1
            ? message('analysis.accessTo', {
                opportunity: gridName,
                cutoff: p.analysis.cutoffMinutes,
                percentile: p.analysis.travelTimePercentile
              })
            : message('analysis.accessToInstantaneous', {
                opportunity: gridName,
                cutoff: p.analysis.cutoffMinutes
              })}
        </P>

        {comparisonAnalysis && (
          <P>
            {comparisonAnalysis.travelTimePercentile !== -1
              ? message('analysis.comparisonAccessTo', {
                  opportunity: comparisonGridName,
                  cutoff: comparisonAnalysis.cutoffMinutes,
                  percentile: comparisonAnalysis.travelTimePercentile
                })
              : message('analysis.comparisonAccessToInstantaneous', {
                  opportunity: comparisonGridName,
                  cutoff: comparisonAnalysis.cutoffMinutes
                })}
          </P>
        )}
      </Group>

      {p.grid ? (
        <Legend
          breaks={p.breaks}
          min={
            comparisonAnalysis != null && p.differenceGrid != null
              ? p.differenceGrid.min
              : p.grid.min
          }
          colors={
            comparisonAnalysis != null
              ? colors.REGIONAL_COMPARISON_GRADIENT
              : colors.REGIONAL_GRADIENT
          }
        />
      ) : (
        <P>Loading grids...</P>
      )}

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
