// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'

import {Application, Dock, Title} from '../base'
import {IconLink} from '../link'
import AggregationArea from '../../containers/aggregation-area'
import RegionalLayer from '../../containers/regional-layer'
import SamplingDistribution from '../../containers/regional-analysis-sampling-distribution'
import OpportunityDatasets from '../../modules/opportunity-datasets'
import LabelLayer from '../map/label-layer'

import ProfileRequestDisplay from './profile-request-display'
import RegionalResults from './regional-results'
import RunningAnalysis from './running-analysis'

export default class RegionalAnalysis extends React.PureComponent<Props, State> {
  props: any

  componentDidMount () {
    const p = this.props
    p.loadRegionalAnalyses(p.regionId)
    p.setActiveRegionalAnalysis({_id: p.analysisId})
  }

  _deleteAnalysis = () => {
    if (window.confirm('Are you sure you want to delete this regional analysis?')) {
      const p = this.props
      p.deleteAnalysis(p.analysis)
    }
  }

  _renameAnalysis = () => {
    const analysis = this.props.analysis
    const name = window.prompt('Please enter a new name', analysis.name)
    if (name != null && name !== analysis.name) {
      this.props.updateRegionalAnalysis({...analysis, name})
    }
  }

  _map = () => {
    const p = this.props
    if (!this.props.analysis) return <div />

    return <div>
      <OpportunityDatasets.components.DotMap />
      <RegionalLayer />
      {p.origin && <SamplingDistribution />}
      {p.aggregationAreaId && <AggregationArea />}
      <LabelLayer />
    </div>
  }

  render () {
    const p = this.props
    const isLoaded = !!p.analysis
    const isComplete = isLoaded && (p.analysis.status == null || p.analysis.status.complete === p.analysis.status.total)
    return (
      <Application map={this._map}>
        <Title>
          <IconLink
            title='Regional results'
            to={`/regions/${p.regionId}/regional`}
            type='chevron-left'
          />
          {isLoaded ? p.analysis.name : message('common.loading')}
          <IconLink
            className='pull-right'
            onClick={this._deleteAnalysis}
            title={message('analysis.deleteRegionalAnalysis')}
            type='trash'
          />
          {isLoaded &&
            <IconLink
              className='pull-right'
              onClick={this._renameAnalysis}
              title={message('analysis.renameRegionalAnalysis')}
              type='pencil'
            />}
        </Title>
        <Dock>
          {isLoaded
            ? <div>
              <ProfileRequestDisplay
                defaultExpanded={!isComplete}
                {...p.analysis}
                {...p.analysis.request}
              />
              {isComplete
                ? <RegionalResults {...p} />
                : <RunningAnalysis
                  analysis={p.analysis}
                  onDelete={this._deleteAnalysis}
                />}
            </div>
            : <p>{message('common.loading')}</p>}
        </Dock>
      </Application>
    )
  }
}
