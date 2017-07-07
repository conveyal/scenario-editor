/** Show progress of regional analysis, and allow displaying a regional analysis on the map */

import React, { PropTypes } from 'react'
import sortBy from 'lodash.sortby'

import DeepEqualComponent from '../deep-equal'
import Icon from '../icon'
import messages from '../../utils/messages'

const REFETCH_INTERVAL = 5 * 1000

export default class RegionalAnalysisSelector extends DeepEqualComponent {
  static propTypes = {
    loadRegionalAnalyses: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    regionalAnalyses: PropTypes.array,
    scenarioId: PropTypes.string.isRequired,
    selectRegionalAnalysis: PropTypes.func.isRequired,
    deleteRegionalAnalysis: PropTypes.func.isRequired
  }

  state = {
    sortedRegionalAnalyses: sortByName(this.props.regionalAnalyses || [])
  }

  componentWillMount () {
    this.fetch()
    this.interval = window.setInterval(this.fetch, REFETCH_INTERVAL)
  }

  componentWillUnmount () {
    window.clearInterval(this.interval)
  }

  componentWillReceiveProps (nextProps) {
    const {regionalAnalyses} = nextProps
    if (regionalAnalyses !== this.props.regionalAnalyses) {
      this.setState({sortedRegionalAnalyses: sortByName(regionalAnalyses || [])})
    }
  }

  fetch = () => {
    const { loadRegionalAnalyses, projectId } = this.props
    loadRegionalAnalyses(projectId)
  }

  _selectRegionalAnalysis = (analysisId) => {
    const {projectId, scenarioId, selectRegionalAnalysis} = this.props
    selectRegionalAnalysis(projectId, scenarioId, analysisId)
  }

  _deleteRegionalAnalysis = (analysisId) => {
    const {deleteRegionalAnalysis} = this.props
    deleteRegionalAnalysis(analysisId)
  }

  render () {
    const {sortedRegionalAnalyses} = this.state
    return (
      <ul className='list-group'>
        {sortedRegionalAnalyses
          .filter(a => !a.deleted)
          .map((a) =>
            <Analysis
              analysis={a}
              key={`analysis-${a.id}`}
              onSelect={this._selectRegionalAnalysis}
              deleteRegionalAnalysis={this._deleteRegionalAnalysis}
              />)}
      </ul>
    )
  }
}

function Analysis ({
  analysis,
  onSelect,
  deleteRegionalAnalysis
}) {
  const complete = analysis.status == null || analysis.status.complete === analysis.status.total
  const percentage = complete ? 100 : analysis.status.complete / analysis.status.total * 100

  return (
    <li className='list-group-item' key={`analysis-selector-${analysis.id}`}>
      {analysis.name}
      {!complete &&
        <span>
          <div className='progress'>
            <div
              className='progress-bar'
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${percentage}%`, minWidth: '2em' }}
              >
              {Math.round(percentage)}%
            </div>
          </div>
          <small>{analysis.status.complete} of {analysis.status.total} complete</small>
        </span>
      }

      <a
        onClick={(e) => deleteRegionalAnalysis(analysis.id)}
        tabIndex={0}
        title={messages.analysis.deleteRegionalAnalysis}
        aria-label={messages.analysis.deleteRegionalAnalysis}
        className='pull-right'
        >
        <Icon type='trash' />
      </a>

      {complete &&
        <a
          onClick={(e) => onSelect(analysis.id)}
          tabIndex={0}
          title={messages.analysis.openRegionalAnalysis}
          aria-label={messages.analysis.openRegionalAnalysis}
          className='pull-right'
          >
          <Icon type='arrow-right' />
        </a>
      }
    </li>
  )
}

const sortByName = (collection) => sortBy(collection, (item) => item.name)
