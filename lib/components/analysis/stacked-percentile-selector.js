// @flow
import {color} from 'd3-color'
import {format} from 'd3-format'
import React, {PureComponent} from 'react'
import memoize from 'lodash/memoize'

import messages from '../../utils/messages'
import {Button, Group as ButtonGroup} from '../buttons'
import colors from '../../constants/colors'

import StackedPercentile from './stacked-percentile'

export const PROJECT = 'project'
export const BASE = 'base'
export const COMPARISON = 'comparison'

const GRAPH_HEIGHT = 300
const GRAPH_WIDTH = 600

/**
 * A component allowing toggling between up to two stacked percentile plots and
 * comparisons of said
 */
export default class StackedPercentileSelector extends PureComponent<Props, State> {
  props: {
    accessibility?: number,
    comparisonAccessibility?: number,
    comparisonInProgress: boolean,
    comparisonPercentileCurves?: number[][],
    comparisonProjectName?: string,
    isFetchingIsochrone: boolean,
    isochroneCutoff: number,
    maxAccessibility: number,
    opportunityDatasetName?: string,
    percentileCurves: number[][],
    projectName: string,
    setIsochroneCutoff: (cutoff: number) => void
  }

  state: {
    scenarioPlotted: 'project' | 'base' | 'comparison'
  }

  state = {
    scenarioPlotted: PROJECT
  }

  _setIsochroneCutoff = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setIsochroneCutoff(parseInt(e.target.value))

  _selectView = memoize((scenarioPlotted: string) => () => this.setState({scenarioPlotted}))

  render () {
    const {
      accessibility,
      comparisonAccessibility,
      comparisonInProgress,
      comparisonPercentileCurves,
      comparisonProjectName,
      opportunityDatasetName,
      isFetchingIsochrone,
      isochroneCutoff,
      maxAccessibility,
      percentileCurves,
      projectName
    } = this.props
    const {scenarioPlotted} = this.state
    const noComparison = !comparisonProjectName

    const commaFormat = format(',d')

    const projectColor = isFetchingIsochrone
      ? colors.STALE_PERCENTILE_COLOR
      : colors.PROJECT_PERCENTILE_COLOR
    const comparisonColor = isFetchingIsochrone
      ? colors.STALE_PERCENTILE_COLOR
      : colors.COMPARISON_PERCENTILE_COLOR

    const colorBar = color(colors.PROJECT_PERCENTILE_COLOR)
    colorBar.opacity = 0.3
    const comparisonColorBar = color(colors.COMPARISON_PERCENTILE_COLOR)
    comparisonColorBar.opacity = 0.3

    return (
      <div>
        <h5>
          Aggregate accessibility to
          {' '}
          <strong>{opportunityDatasetName || `[select opportunity dataset]`}</strong>
          {' '}
          within
          {' '}
          <strong>{isochroneCutoff}</strong>
          {' '}
          minutes
        </h5>

        <input
          className='form-control'
          type='range'
          value={isochroneCutoff}
          min={1}
          max={120}
          title={messages.analysis.cutoff}
          onChange={this._setIsochroneCutoff}
          style={{
            boxShadow: 'none',
            width: 568,
            position: 'relative',
            left: 46
          }}
        />

        {accessibility !== null &&
          <div className='progress'>
            <div
              className='progress-bar'
              role='progressbar'
              style={{
                backgroundColor: colorBar.toString(),
                width: `${(accessibility || 1) / maxAccessibility * 100}%`
              }}
            >
              <div className='project-name'>
                {`${projectName} (Median)`}
              </div>
            </div>
            <div className='statistic'>
              {commaFormat(accessibility)}
            </div>
          </div>}

        {comparisonInProgress &&
          comparisonProjectName &&
          comparisonAccessibility != null &&
          <div className='progress'>
            <div
              className='progress-bar'
              role='progressbar'
              style={{
                backgroundColor: comparisonColorBar.toString(),
                width: `${comparisonAccessibility / maxAccessibility * 100}%`
              }}
            >
              <div className='project-name'>
                {`${comparisonProjectName} (Median)`}
              </div>
            </div>
            <div className='statistic'>
              {commaFormat(comparisonAccessibility)}
            </div>
          </div>}

        {accessibility !== null &&
          <ButtonGroup justified>
            <Button
              active={noComparison || scenarioPlotted === PROJECT}
              disabled={noComparison}
              onClick={this._selectView(PROJECT)}
              size='sm'
              value={PROJECT}
            >
              {projectName}
            </Button>
            <Button
              active={!noComparison && scenarioPlotted === BASE}
              disabled={noComparison}
              onClick={this._selectView(BASE)}
              size='sm'
            >
              {comparisonProjectName || 'No comparison selected'}
            </Button>
            <Button
              active={!noComparison && scenarioPlotted === COMPARISON}
              disabled={noComparison}
              onClick={this._selectView(COMPARISON)}
              size='sm'
            >
              {messages.analysis.comparison}
            </Button>
          </ButtonGroup>}

        {percentileCurves &&
          <StackedPercentile
            percentileCurves={percentileCurves}
            comparisonPercentileCurves={comparisonPercentileCurves}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            isochroneCutoff={isochroneCutoff}
            opportunityDatasetName={opportunityDatasetName}
            textColor={'#333333'}
            color={projectColor}
            comparisonColor={comparisonColor}
            maxAccessibility={maxAccessibility}
            selected={comparisonPercentileCurves ? scenarioPlotted : PROJECT}
            label={projectName}
            comparisonLabel={comparisonProjectName}
          />}
      </div>
    )
  }
}
