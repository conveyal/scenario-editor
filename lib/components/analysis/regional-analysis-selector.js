import {Select as ChakraSelect} from '@chakra-ui/core'
import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setActiveRegionalAnalysis,
  setRegionalAnalysisDisplayCutoff
} from 'lib/actions/analysis/regional'
import selectDisplayCutoff from 'lib/selectors/regional-display-cutoff'

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
  const displayCutoff = useSelector(selectDisplayCutoff)
  const [activeId, setActiveId] = React.useState(get(p, 'activeAnalysis._id'))
  const runningAnalyses = p.allAnalyses.filter(isRunning)

  function onChange(a) {
    setActiveId(get(a, '_id'))
    setImmediate(() => dispatch(setActiveRegionalAnalysis(a)))
  }

  function onChangeCutoff(e) {
    dispatch(setRegionalAnalysisDisplayCutoff(e.target.value))
  }

  const cutoffsMinutes = get(p, 'activeAnalysis.cutoffsMinutes')

  return (
    <>
      <Group>
        <Select
          isClearable
          onChange={onChange}
          getOptionLabel={a => a.name}
          getOptionValue={a => a._id}
          options={p.allAnalyses}
          placeholder='View a regional analysis...'
          value={p.allAnalyses.find(a => a._id === activeId)}
        />
      </Group>
      {activeId
        ? Array.isArray(cutoffsMinutes) && (
            <div className='DEV'>
              <ChakraSelect
                mb={4}
                onChange={onChangeCutoff}
                value={displayCutoff}
              >
                {cutoffsMinutes.map(m => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </ChakraSelect>
            </div>
          )
        : runningAnalyses.length > 0 && (
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
          )}
    </>
  )
}
