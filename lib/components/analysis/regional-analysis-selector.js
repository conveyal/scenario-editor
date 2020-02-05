import {Select as ChakraSelect, Stack} from '@chakra-ui/core'
import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import useControlledInput from 'lib/hooks/use-controlled-input'
import selectDisplayCutoff from 'lib/selectors/regional-display-cutoff'
import selectDisplayPercentile from 'lib/selectors/regional-display-percentile'

import Select from '../select'
import {Group} from '../input'

import RunningAnalysis from './running-analysis'

const isRunning = analysis =>
  analysis.status && analysis.status.complete !== analysis.status.total

/**
 * Show progress of regional analysis, and allow displaying a regional analysis
 * on the map
 */
export default function RegionalAnalysisSelector(p) {
  const dispatch = useDispatch()
  const runningAnalyses = p.allAnalyses.filter(isRunning)
  const cutoffsMinutes = get(p, 'activeAnalysis.cutoffsMinutes')
  const percentiles = get(p, 'activeAnalysis.travelTimePercentiles')
  const [activeId, onChange] = useControlledInput(
    get(p, 'activeAnalysis._id'),
    v => dispatch(setSearchParameter('analysisId', v))
  )
  const [cutoff, onChangeCutoff] = useControlledInput(
    useSelector(selectDisplayCutoff),
    v => dispatch(setSearchParameter('cutoff', v))
  )
  const [percentile, onChangePercentile] = useControlledInput(
    useSelector(selectDisplayPercentile),
    v => dispatch(setSearchParameter('percentile', v))
  )

  return (
    <>
      <Group>
        <Select
          isClearable
          onChange={v => onChange(get(v, '_id'))}
          getOptionLabel={a => a.name}
          getOptionValue={a => a._id}
          options={p.allAnalyses}
          placeholder='View a regional analysis...'
          value={p.allAnalyses.find(a => a._id === activeId)}
        />
      </Group>
      {activeId ? (
        <Stack spacing={4} mb={4}>
          {Array.isArray(cutoffsMinutes) && (
            <ChakraSelect onChange={onChangeCutoff} value={cutoff}>
              {cutoffsMinutes.map(m => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </ChakraSelect>
          )}
          {Array.isArray(percentiles) && (
            <ChakraSelect onChange={onChangePercentile} value={percentile}>
              {percentiles.map(p => (
                <option key={p} value={p}>
                  {p}th percentile
                </option>
              ))}
            </ChakraSelect>
          )}
        </Stack>
      ) : (
        runningAnalyses.length > 0 && (
          <Group>
            <ul className='list-group'>
              {runningAnalyses.map(a => (
                <RunningAnalysis
                  analysis={a}
                  key={a._id}
                  onDelete={() => p.deleteAnalysis(a._id)}
                />
              ))}
            </ul>
          </Group>
        )
      )}
    </>
  )
}
