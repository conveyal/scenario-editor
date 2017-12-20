// @flow
import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import {Map as LeafletMap} from 'leaflet'
import React from 'react'
import Select from 'react-select'
import {sprintf} from 'sprintf-js'

import BookmarkChooser from '../../containers/bookmark-chooser'
import messages from '../../utils/messages'
import {Button, Group as ButtonGroup} from '../buttons'
import InnerDock from '../inner-dock'
import StackedPercentileSelector
  from '../../containers/stacked-percentile-selector'
import {Group, Slider} from '../input'
import Collapsible from '../collapsible'
import ProfileRequestEditor from './profile-request-editor'
import ProjectApplicationError from './project-application-error'

import OpportunityDatasets from '../../modules/opportunity-datasets'

import type {
  Modification,
  ProfileRequest,
  ReactSelectResult
} from '../../types'

type Bounds = {
  north: number,
  south: number,
  east: number,
  west: number
}

type Props = {
  bundleId: string,
  comparisonBundleId?: string,
  comparisonProjectId?: string,
  comparisonVariant: number,
  isFetchingIsochrone: boolean,
  isochroneFetchStatusMessage?: string,
  isShowingComparisonIsochrone: boolean,
  isShowingIsochrone: boolean,
  isShowingOpportunities: boolean,
  modifications: Modification[],
  profileRequest: ProfileRequest,
  regionId: string,
  regionBounds: Bounds,
  regionalAnalyses: Array<Bounds & {
      _id: string,
      name: string,
      height: number,
      width: number,
      zoom: number
    }>,
  regionalAnalysisBounds?: Bounds,
  projectApplicationErrors?: Array<{}>,
  projectApplicationWarnings?: Array<{}>,
  projectId: string,
  projectName: string,
  projects: Array<{
    _id: string,
    name: string,
    variants: string[]
  }>,
  variantIndex: number,
  variantName: string,
  variants: string[],

  addEditRegionalAnalysisBoundsLayerToMap(): void,
  addIsochroneLayerToMap(): void,
  addOpportunityLayerToMap(): void,
  clearComparisonProject(): void,
  createRegionalAnalysis: any => void,
  downloadComparisonIsochrone: () => void,
  downloadIsochrone: () => void,
  enterAnalysisMode(): void,
  exitAnalysisMode(): void,
  fetchTravelTimeSurface(): void,
  loadAllRegionalAnalyses: (regionId: string) => void,
  push(string): void,
  removeEditRegionalAnalysisBoundsLayerFromMap(): void,
  removeIsochroneLayerFromMap(): void,
  removeOpportunityLayerFromMap(): void,
  setActiveVariant(): void,
  setComparisonProject(): void,
  setProfileRequest: (profileRequestFields: any) => void
}

type State = {
  creatingRegionalAnalysis: boolean,
  editingBounds: boolean,
  regionalAnalysisName: void | string
}

/**
 * The side panel for single point analysis, including the stacked percentile plot.
 */
export default class SinglePointAnalysis extends Pure {
  props: Props
  state: State

  state = {
    creatingRegionalAnalysis: false,
    editingBounds: false,
    regionalAnalysisName: undefined
  }

  visible = true

  componentDidMount () {
    this.props.enterAnalysisMode()
    this.props.addIsochroneLayerToMap()
    this.props.addOpportunityLayerToMap()
    this.props.loadAllRegionalAnalyses(this.props.regionId)

    if (!this.props.profileRequest.fromLat || !this.props.profileRequest.fromLon) {
      const {north, south, east, west} = this.props.regionBounds
      this.props.setProfileRequest({
        fromLat: (north + south) / 2,
        fromLon: (east + west) / 2
      })
    }
  }

  componentWillUnmount () {
    this.props.exitAnalysisMode()
    this.props.removeIsochroneLayerFromMap()
    this.props.removeOpportunityLayerFromMap()
    this.props.removeEditRegionalAnalysisBoundsLayerFromMap()
    // tag this component as having unmounted, so that if additional isochrones
    // come back (generally caused when someone exits analysis mode before the
    // cluster is initialized) they don't get displayed on the map. We are not
    // using state here because setState is async, so result could come back
    // between unmount and state update: https://facebook.github.io/react/docs/react-component.html#setstate
    this.visible = false
  }

  _createRegionalAnalysis = () => {
    const {regionalAnalyses} = this.props
    const name = window.prompt(
      'Enter a name and click ok to begin a regional analysis job for this project and settings:',
      `Analysis ${regionalAnalyses.length + 1}`
    )
    if (name && name.length > 0) {
      const {
        createRegionalAnalysis,
        profileRequest,
        regionBounds,
        regionalAnalysisBounds
      } = this.props
      createRegionalAnalysis({
        bounds: regionalAnalysisBounds || regionBounds,
        name,
        profileRequest
      })
    }
  }

  setActiveVariant = (option: ReactSelectResult) => {
    this.props.setProfileRequest({variantIndex: parseInt(option.value)})
  }

  /** show the regional analysis creation name box */
  prepareCreateRegionalAnalysis = () => {
    this.props.addEditRegionalAnalysisBoundsLayerToMap()
    this.setState({creatingRegionalAnalysis: true})
  }

  _showBoundsSelector = () => {
    this.props.addEditRegionalAnalysisBoundsLayerToMap()
    this.setState({editingBounds: true})
  }

  _hideBoundsSelector = () => {
    this.props.removeEditRegionalAnalysisBoundsLayerFromMap()
    this.setState({editingBounds: false})
  }

  _setTravelTimePercentile = (e: Event & {target: HTMLInputElement}) =>
    this.props.setProfileRequest({travelTimePercentile: Number(e.target.value)})

  _setRegionalAnalysisBounds = (e: {value: string}) => {
    const {
      regionBounds,
      regionalAnalyses
    } = this.props

    if (e.value === '__REGION') {
      this.props.setProfileRequest({bounds: regionBounds})
    } else if (regionalAnalyses) {
      const foundAnalyses = regionalAnalyses.find(r => r._id === e.value)
      if (foundAnalyses) {
        this.props.setProfileRequest({bounds: webMercatorBoundsToGeographic(foundAnalyses)})
      }
    }
  }

  render () {
    const {
      downloadComparisonIsochrone,
      downloadIsochrone,
      fetchTravelTimeSurface,
      isFetchingIsochrone,
      isochroneFetchStatusMessage,
      isShowingComparisonIsochrone,
      isShowingIsochrone,
      profileRequest,
      projectApplicationErrors,
      projectApplicationWarnings,
      variants
    } = this.props
    const {creatingRegionalAnalysis} = this.state
    const disableInputs = !!isFetchingIsochrone || !!projectApplicationErrors

    return (
      <div>
        <div className='ApplicationDockTitle'>
          <Icon type='area-chart' /> Analysis

          <Button
            className='pull-right'
            disabled={disableInputs}
            onClick={fetchTravelTimeSurface}
            style='primary'
          >
            <Icon
              type='refresh'
              className={isFetchingIsochrone ? 'fa-spin' : ''}
            />
            {' '}
            {isFetchingIsochrone
              ? messages.analysis.fetchStatus[isochroneFetchStatusMessage]
              : messages.analysis.refresh}
          </Button>

          <Button
            className='pad-right pull-right'
            disabled={disableInputs || creatingRegionalAnalysis}
            style='success'
            onClick={this._createRegionalAnalysis}
          >
            {creatingRegionalAnalysis
              ? <Icon spin type='refresh' />
              : <Icon type='plus' />}
            {messages.analysis.newRegionalAnalysis}
          </Button>
        </div>

        <InnerDock>
          <div className='block'>
            {projectApplicationWarnings != null &&
              projectApplicationWarnings.length > 0 &&
              <div className='alert alert-warning'>
                <Collapsible
                  title={
                    <span className='text-warning'>
                      <Icon type='exclamation-circle' />&nbsp;
                      {messages.analysis.warningsInProject}
                    </span>
                  }
                >
                  <ProjectApplicationErrors
                    errors={projectApplicationWarnings}
                  />
                </Collapsible>
              </div>}

            {projectApplicationErrors != null &&
              projectApplicationErrors.length > 0 &&
              <div className='alert alert-danger'>
                <strong>
                  <Icon type='exclamation-circle' />{' '}
                  {messages.analysis.errorsInProject}
                </strong>
                <br />
                <ProjectApplicationErrors errors={projectApplicationErrors} />
              </div>}

            <div className='row'>
              <Group label={messages.common.scenario} className='col-xs-6'>
                <Select
                  clearable={false}
                  disabled={isFetchingIsochrone}
                  options={variants.map((v, index) => ({
                    label: v,
                    value: index
                  }))}
                  value={profileRequest.variantIndex}
                  onChange={this.setActiveVariant}
                />
              </Group>

              <Group label={messages.analysis.grid} className='col-xs-6'>
                <OpportunityDatasets.components.Selector />
              </Group>
            </div>

            {this.renderComparisonSelect()}
          </div>

          <StackedPercentileSelector />

          <div className='block'>
            <ButtonGroup justified>
              <Button
                disabled={!isShowingIsochrone}
                onClick={downloadIsochrone}
                style='info'
                ><Icon type='download' /> Isochrone as GeoJSON
              </Button>
              <Button
                disabled={!isShowingComparisonIsochrone}
                onClick={downloadComparisonIsochrone}
                style='info'
                ><Icon type='download' /> Comparison Isochrone as GeoJSON
              </Button>
            </ButtonGroup>

            <BookmarkChooser />
            <ProfileRequestEditor
              disabled={disableInputs}
              profileRequest={profileRequest}
              updateProfileRequest={this.props.setProfileRequest}
            />

            {this.renderRegionalAnalysisBoundsSelector(disableInputs)}

            {/*
              * A slider for selecting the percentile to use in a regional analysis.
              * This will eventually be moved into analysis settings once we can calculate multiple
              * percentiles in single point mode.
              */}
            <Slider
              disabled={disableInputs}
              value={profileRequest.travelTimePercentile || 50}
              output
              format='.1f'
              min={1}
              max={99}
              step={1}
              label={`${messages.analysis.travelTimePercentile} (Regional only)`}
              onChange={this._setTravelTimePercentile}
            />
          </div>
        </InnerDock>
      </div>
    )
  }

  /** Render the dropdown box that allows selecting regional analysis bounds */
  renderRegionalAnalysisBoundsSelector (disableInputs: boolean) {
    const {regionalAnalysisBounds, regionBounds, regionalAnalyses} = this.props

    // figure out which is selected
    let selected
    if (
      !regionalAnalysisBounds ||
      boundsEqual(regionalAnalysisBounds, regionBounds)
    ) {
      selected = '__REGION' // special value
    } else {
      const selectedAnalysis = regionalAnalyses.find(r =>
        boundsEqual(webMercatorBoundsToGeographic(r), regionalAnalysisBounds)
      )

      if (selectedAnalysis != null) selected = selectedAnalysis._id
      else selected = '__CUSTOM'
    }

    const options = [
      {value: '__REGION', label: messages.analysis.regionalBoundsRegion},
      ...regionalAnalyses.map(({name, _id}) => ({
        value: _id,
        label: sprintf(messages.analysis.regionalBoundsSame, name)
      }))
    ]

    if (selected === '__CUSTOM') {
      // Don't allow the user to select 'Custom' - to make custom bounds, just drag the map markers
      options.push({
        value: '__CUSTOM',
        label: messages.analysis.regionalBoundsCustom,
        disabled: true
      })
    }

    const {editingBounds} = this.state

    return (
      <Group label={messages.analysis.regionalBounds}>
        <div className='row'>
          <div className='col-xs-6'>
            <Select
              clearable={false}
              disabled={disableInputs}
              value={selected}
              options={options}
              onChange={this._setRegionalAnalysisBounds}
            />
          </div>
          <div className='col-xs-6'>
            {editingBounds
              ? <Button
                block
                onClick={this._hideBoundsSelector}
                style='warning'
                >
                <Icon type='stop' /> Stop editing bounds
                </Button>
              : <Button
                disabled={disableInputs}
                block
                onClick={this._showBoundsSelector}
                style='warning'
                >
                <Icon type='pencil' /> Set custom geographic bounds
                </Button>}
          </div>
        </div>
      </Group>
    )
  }

  _setComparisonProject = (result: ReactSelectResult) => {
    const {
      clearComparisonProject,
      projects,
      setComparisonProject
    } = this.props
    if (result) {
      // since the comparison is clearable
      const id = result.value
      setComparisonProject({
        ...projects.find(s => s._id === id),
        variantIndex: -1
      })
    } else {
      clearComparisonProject()
    }
  }

  setComparisonVariant = (e: ReactSelectResult) => {
    const {projects, comparisonProjectId, setComparisonProject} = this.props
    const project = projects.find(s => s._id === comparisonProjectId)
    if (e) {
      setComparisonProject({...project, variantIndex: e.value})
    }
  }

  /** render the text boxes to choose a comparison project and variant */
  renderComparisonSelect () {
    const {
      comparisonProjectId,
      comparisonVariant,
      isFetchingIsochrone,
      projects
    } = this.props

    const projectOptions = projects.map(s => {
      return {value: s._id, label: s.name}
    })
    const chosenProject = projects.find(s => s._id === comparisonProjectId)

    const variantOptions = chosenProject != null
      ? [
          // special value -1 indicates no modifications
          {label: messages.analysis.baseline, value: -1},
        ...chosenProject.variants.map((label, value) => {
          return {label, value}
        })
      ]
      : []

    return (
      <div className='row'>
        <Group label={messages.analysis.comparison + ' ' + messages.common.project} className='col-xs-6'>
          <Select
            disabled={isFetchingIsochrone}
            name={messages.common.project}
            onChange={this._setComparisonProject}
            options={projectOptions}
            placeholder={messages.analysis.selectComparisonProject}
            value={comparisonProjectId}
          />
        </Group>

        <Group label={messages.analysis.comparison + ' ' + messages.common.scenario} className='col-xs-6'>
          <Select
            disabled={!comparisonProjectId}
            clearable={false}
            name={messages.common.scenario}
            onChange={this.setComparisonVariant}
            options={variantOptions}
            placeholder={messages.analysis.selectComparisonProjectVariant}
            value={comparisonVariant}
          />
        </Group>
      </div>
    )
  }
}

function ProjectApplicationErrors ({errors}) {
  /** Render any errors that may have occurred applying the project */
  return (
    <div>
      {errors.map((err, idx) => (
        <ProjectApplicationError error={err} key={`err-${idx}`} />
      ))}
    </div>
  )
}

/** Convert web mercator bounds from a regional analysis to geographic bounds */
function webMercatorBoundsToGeographic ({
  north,
  west,
  width,
  height,
  zoom
}: {
  north: number,
  west: number,
  height: number,
  width: number,
  zoom: number
}) {
  const nw = LeafletMap.prototype.unproject([west + 1, north], zoom)
  const se = LeafletMap.prototype.unproject(
    [west + width + 1, north + height],
    zoom
  )
  return {
    north: nw.lat,
    south: se.lat,
    east: se.lng,
    west: nw.lng
  }
}

function boundsEqual (b0, b1, epsilon = 1e-6) {
  return (
    Math.abs(b0.north - b1.north) < epsilon &&
    Math.abs(b0.west - b1.west) < epsilon &&
    Math.abs(b0.east - b1.east) < epsilon &&
    Math.abs(b0.south - b1.south) < epsilon
  )
}
