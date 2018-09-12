// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React, {Component} from 'react'
import Select from 'react-select'

import {Button} from '../buttons'
import colors from '../../constants/colors'
import {Slider, Group, Text, File} from '../input'
import OpportunityDatasets from '../../modules/opportunity-datasets'
import type {
  RegionalAnalysis,
  Grid,
  AggregationArea,
  AggregateAccessibility as AggregateAccessibilityType,
  OpportunityDataset,
  ReactSelectResult
} from '../../types'

import ProfileRequestDisplay from './profile-request-display'
import Legend from './legend'
import AggregateAccessibility from './aggregate-accessibility'

type Props = {
  accessToName: string,
  aggregateAccessibility?: AggregateAccessibilityType,
  aggregationAreaId?: string,
  aggregationAreaUploading?: boolean,
  aggregationAreas: AggregationArea[],
  aggregationWeightsId?: string,
  aggregationWeightsName?: string,
  analysis: RegionalAnalysis,
  analysisId: string,
  breaks: number[],
  comparisonAccessToName?: string,
  comparisonAggregateAccessibility?: AggregateAccessibilityType,
  comparisonAnalysis?: RegionalAnalysis,
  differenceGrid?: Grid,
  fetch: any => any,
  grid?: Grid,
  loadRegionalAnalysisGrids: (any) => void,
  minimumImprovementProbability: number,
  opportunityDatasets: OpportunityDataset[],
  projectId: string,

  // actions
  regionId: string,
  regionalAnalyses?: RegionalAnalysis[],
  setActiveRegionalAnalysis: any => void,
  setAggregationArea: (opts: void | {aggregationAreaId: string, regionId: string}) => void,
  setMinimumImprovementProbability: number => void,
  uploadAggregationArea: (arg: {
    files: FileList,
    name: string,
    regionId: string
  }) => void
}

type State = {
  aggregationAreaFiles: null | FileList,
  aggregationAreaName: null | string,
  showAggregationAreaUpload: boolean
}

/** render a regional analysis */
export default class RegionalResults extends Component<void, Props, State> {
  state = {
    aggregationAreaFiles: null,
    aggregationAreaName: null,
    showAggregationAreaUpload: false
  }

  componentDidMount () {
    this.props.loadRegionalAnalysisGrids({_id: this.props.analysisId})
  }

  selectComparisonAnalysis = (chosen: ReactSelectResult): void => {
    const ids = {_id: this.props.analysisId, comparisonId: undefined}
    if (chosen != null) ids.comparisonId = chosen.value

    this.props.setActiveRegionalAnalysis(ids)
    this.props.loadRegionalAnalysisGrids(ids)
  }

  selectAggregationArea = (e: ReactSelectResult) => {
    const {
      regionId,
      setAggregationArea
    } = this.props

    if (e) {
      if (e.value === 'new-aggregation-area') {
        this.setState({showAggregationAreaUpload: true})
      } else {
        setAggregationArea({regionId, aggregationAreaId: e.value})
      }
    } else {
      setAggregationArea()
    }
  }

  renderComparisonSelector () {
    const {regionalAnalyses, comparisonAnalysis, analysis} = this.props

    if (!analysis || !regionalAnalyses) return null // don't render until loaded

    const options = regionalAnalyses
      .filter(({_id}) => _id !== analysis._id)
      // don't render deleted analyses
      .filter(({deleted}) => !deleted)
      // don't compare incomparable analyses
      .filter(
        ({zoom, width, height, north, west}) =>
          zoom === analysis.zoom &&
          width === analysis.width &&
          height === analysis.height &&
          north === analysis.north &&
          west === analysis.west
      )
      .map(({_id, name}) => {
        return {value: _id, label: name}
      })

    return (
      <Group label={message('analysis.compareTo')}>
        <Select
          value={comparisonAnalysis ? comparisonAnalysis._id : null}
          options={options}
          onChange={this.selectComparisonAnalysis}
        />
      </Group>
    )
  }

  /** Called when editing the new aggregation area name */
  changeAggregationAreaName = (e: SyntheticInputEvent<HTMLInputElement>): void =>
    this.setState({aggregationAreaName: e.target.value})

  /** Called when selecting files to upload */
  changeAggregationAreaFiles = (
    e: Event & {target: {files: FileList}}
  ): void => {
    this.setState({aggregationAreaFiles: e.target.files})
  }

  uploadAggregationArea = (e: Event): void => {
    e.preventDefault()
    const {uploadAggregationArea, regionId} = this.props
    const {aggregationAreaFiles, aggregationAreaName} = this.state

    if (!aggregationAreaName || !aggregationAreaFiles) {
      throw new Error('Attempt to upload null aggregation area')
    }

    uploadAggregationArea({
      name: aggregationAreaName,
      files: aggregationAreaFiles,
      regionId
    })
    this.setState({
      aggregationAreaName: null,
      aggregationAreaFiles: null,
      showAggregationAreaUpload: false
    })
  }

  /** Render controls for weighted average accessibility */
  renderAggregation () {
    const {
      aggregationAreas,
      aggregationAreaId,
      aggregationWeightsId,
      aggregateAccessibility,
      comparisonAggregateAccessibility,
      comparisonAnalysis,
      aggregationAreaUploading,
      analysis
    } = this.props
    const {
      showAggregationAreaUpload,
      aggregationAreaName,
      aggregationAreaFiles
    } = this.state

    const aggregationAreaOptions = aggregationAreas.map(aa => ({
      value: aa._id,
      label: aa.name
    }))
    aggregationAreaOptions.push({
      label: message('analysis.newAggregationArea'),
      value: 'new-aggregation-area' // IDs of aggregation areas are UUIDs so this will not conflict
    })

    return (
      <div>
        <Group label={message('analysis.aggregateTo')}>
          <Select
            name='aggregateTo'
            options={aggregationAreaOptions}
            value={aggregationAreaId}
            onChange={this.selectAggregationArea}
          />
        </Group>

        {showAggregationAreaUpload &&
          <form onSubmit={this.uploadAggregationArea}>
            <Group label={message('analysis.aggregationAreaName')}>
              <Text
                name='Name'
                value={aggregationAreaName}
                onChange={this.changeAggregationAreaName}
              />
            </Group>

            <Group label={message('analysis.aggregationAreaFiles')}>
              <File
                multiple
                name='files'
                onChange={this.changeAggregationAreaFiles}
              />
            </Group>

            <input
              className='btn btn-block btn-success'
              disabled={
                aggregationAreaUploading ||
                  !aggregationAreaName ||
                  !aggregationAreaFiles
              }
              type='submit'
              value={message('analysis.uploadAggregationArea')}
            />
          </form>}

        {aggregationAreaId &&
          <Group label={message('analysis.weightBy')}>
            <OpportunityDatasets.components.Selector />
          </Group>}

        {aggregationAreaUploading &&
          <span>
            <Icon type='fa-spinner' spin />&nbsp;{message('analysis.uploading')}
          </span>}

        {analysis && aggregateAccessibility && aggregationWeightsId &&
          <AggregateAccessibility
            aggregateAccessibility={aggregateAccessibility}
            comparisonAggregateAccessibility={comparisonAggregateAccessibility}
            weightByName={this.findOpportunityDatasetName(aggregationWeightsId)}
            accessToName={this.findOpportunityDatasetName(analysis.grid)}
            regionalAnalysisName={analysis.name}
            comparisonAccessToName={
              comparisonAnalysis
                ? this.findOpportunityDatasetName(comparisonAnalysis.grid)
                : ''
            }
            comparisonRegionalAnalysisName={
              comparisonAnalysis
                ? comparisonAnalysis.name
                : ''
            }
          />}
      </div>
    )
  }

  /**
   * Perform an authenticated fetch to get a presigned URL to download a grid from S3,
   * then download it. Pass in the path to fetch.
   */
  downloadFromS3 (url: string) {
    this.props.fetch({
      url,
      next (response) {
        window.open(response.value.url)
      }
    })
  }

  downloadProjectGIS = (e: Event) => {
    e.preventDefault()
    if (this.props.analysis) {
      this.downloadFromS3(
        `/api/regional/${this.props.analysis._id}/grid/tiff?redirect=false`
      )
    } else {
      throw new Error('Attempt to dowload analysis that has not yet loaded!')
    }
  }

  downloadComparisonGIS = (e: Event) => {
    e.preventDefault()
    if (this.props.comparisonAnalysis) {
      this.downloadFromS3(
        `/api/regional/${this.props.comparisonAnalysis._id}/grid/tiff?redirect=false`
      )
    } else {
      throw new Error(
        'Attempt to dowload comparison analysis that has not yet loaded!'
      )
    }
  }

  downloadProbabilityGIS = (e: Event) => {
    e.preventDefault()
    if (this.props.analysis && this.props.comparisonAnalysis) {
      this.downloadFromS3(
        `/api/regional/${this.props.analysis._id}/${this.props.comparisonAnalysis._id}/tiff?redirect=false`
      )
    } else {
      throw new Error(
        'Attempt to download probability surface when both analyses have not loaded.'
      )
    }
  }

  render () {
    const {
      analysis,
      breaks,
      comparisonAnalysis,
      differenceGrid,
      grid,
      minimumImprovementProbability,
      setMinimumImprovementProbability
    } = this.props

    return (
      <div>
        {this.renderComparisonSelector()}

        {comparisonAnalysis &&
          <div>
            {analysis.workerVersion !== comparisonAnalysis.workerVersion &&
              <div className='alert alert-danger'>{message('r5Version.comparisonIsDifferent')}</div>}

            <ProfileRequestDisplay
              {...comparisonAnalysis}
              {...comparisonAnalysis.request}
            />
          </div>}

        {comparisonAnalysis &&
          <MinimumImprovementProbabilitySelector
            minimumImprovementProbability={minimumImprovementProbability}
            setMinimumImprovementProbability={
              setMinimumImprovementProbability
            }
          />}

        <p>
          {analysis.travelTimePercentile !== -1 &&
            message('analysis.accessTo', {
              opportunity: this.findOpportunityDatasetName(analysis.grid),
              cutoff: analysis.cutoffMinutes,
              percentile: analysis.travelTimePercentile
            })}
          {analysis.travelTimePercentile === -1 &&
            message('analysis.accessToInstantaneous', {
              opportunity: this.findOpportunityDatasetName(analysis.grid),
              cutoff: analysis.cutoffMinutes
            })}
        </p>

        {comparisonAnalysis &&
          <p>
            {comparisonAnalysis.travelTimePercentile !== -1 &&
              message('analysis.comparisonAccessTo', {
                opportunity: this.findOpportunityDatasetName(comparisonAnalysis.grid),
                cutoff: comparisonAnalysis.cutoffMinutes,
                percentile: comparisonAnalysis.travelTimePercentile
              })}
            {comparisonAnalysis.travelTimePercentile === -1 &&
              message('analysis.comparisonAccessToInstantaneous', {
                opportunity: this.findOpportunityDatasetName(comparisonAnalysis.grid),
                cutoff: comparisonAnalysis.cutoffMinutes
              })}
          </p>}

        {grid
          ? <Legend
            breaks={breaks}
            min={
              comparisonAnalysis != null && differenceGrid != null
                ? differenceGrid.min
                : grid.min
            }
            colors={
              comparisonAnalysis != null
                ? colors.REGIONAL_COMPARISON_GRADIENT
                : colors.REGIONAL_GRADIENT
            }
          />
          : <p>Loading grids...</p>}

        {this.renderAggregation()}

        <Group label={message('analysis.gisExport')}>
          <Button block onClick={this.downloadProjectGIS} style='info'>
            {message('analysis.downloadRegional', {name: analysis.name})}
          </Button>
          {comparisonAnalysis &&
            <Button block onClick={this.downloadComparisonGIS} style='info'>
              {message('analysis.downloadRegional', {
                name: comparisonAnalysis.name
              })}
            </Button>}
          {comparisonAnalysis &&
            <Button block onClick={this.downloadProbabilityGIS} style='info'>
              {message('analysis.downloadRegionalProbability')}
            </Button>}
        </Group>
      </div>
    )
  }

  // TODO replace with selector
  findOpportunityDatasetName (_id: string): string {
    const value = this.props.opportunityDatasets.find(i => i._id === _id)
    return value != null ? value.name : _id
  }
}

function MinimumImprovementProbabilitySelector ({
  minimumImprovementProbability,
  setMinimumImprovementProbability
}) {
  return (
    <Slider
      label={message('analysis.minimumImprovementProbability')}
      output
      format='.2f'
      min={0}
      max={1}
      step={0.01}
      value={minimumImprovementProbability}
      onChange={e =>
        setMinimumImprovementProbability(parseFloat(e.target.value))}
    />
  )
}
