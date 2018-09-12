// @flow
import _memoize from 'lodash/memoize'
import React from 'react'
import Select from 'react-select'

import {Group} from '../input'

import RunningAnalysis from './running-analysis'

type Props = {
  allAnalyses: any[],

  deleteAnalysis: (analysisId: string) => void,
  goToAnalysis: (analysisId: string) => void
}

const isRunning = (analysis) =>
  analysis.status && (analysis.status.complete !== analysis.status.total)

/**
 * Show progress of regional analysis, and allow displaying a regional analysis
 * on the map
 */
export default class RegionalAnalysisSelector extends React.PureComponent<Props, State> {
  _deleteRegionalAnalysis = _memoize((analysisId: string) => () =>
    window.confirm('Are you sure you wish to cancel this regional analysis?') &&
    this.props.deleteAnalysis(analysisId))

  _goToRegionalAnalysis = (selected: any) =>
    this.props.goToAnalysis(selected.value)

  render () {
    const {allAnalyses} = this.props
    const runningAnalyses = allAnalyses.filter(isRunning)
    return (
      <div>
        <Group>
          <Select
            onChange={this._goToRegionalAnalysis}
            options={allAnalyses.map(a =>
              ({value: a._id, label: a.name}))}
            placeholder='View a regional analysis...'
          />
        </Group>
        {runningAnalyses.length > 0 &&
          <Group>
            <RunningAnalyses
              analyses={runningAnalyses}
              deleteRegionalAnalysis={this._deleteRegionalAnalysis}
            />
          </Group>}
      </div>
    )
  }
}

function RunningAnalyses (props) {
  return (
    <ul className='list-group'>
      {props.analyses
        .map(a => (
          <RunningAnalysis
            analysis={a}
            key={`analysis-${a._id}`}
            onDelete={props.deleteRegionalAnalysis(a._id)}
          />
        ))}
    </ul>
  )
}
