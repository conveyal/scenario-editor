// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import {MapEvent} from 'leaflet'
import get from 'lodash/get'
import React from 'react'
import {GeoJSON, Marker} from 'react-leaflet'
import Select from 'react-select'
import uuid from 'uuid'

import BookmarkChooser from '../../containers/bookmark-chooser'
import {Button, Group as ButtonGroup} from '../buttons'
import Collapsible from '../collapsible'
import colors from '../../constants/colors'
import DestinationTravelTimeDistribution from '../map/destination-travel-time-distribution'
import EditBounds from '../map/edit-bounds'
import ErrorModal from '../error-modal'
import InnerDock from '../inner-dock'
import {Group, Slider} from '../input'
import LabelLayer from '../map/label-layer'
import Map from '../map'
import messages from '../../utils/messages'
import ModificationsMap from '../../containers/modifications-map'
import OpportunityDatasets from '../../modules/opportunity-datasets'
import Sidebar from '../sidebar'
import StackedPercentileSelector
  from '../../containers/stacked-percentile-selector'
import type {
  LonLat,
  ProfileRequest,
  Quintiles,
  ReactSelectResult
} from '../../types'

import ScenarioApplicationError from './scenario-application-error'
import ProfileRequestEditor from './profile-request-editor'
import AdvancedSettings from './advanced-settings'

type Bounds = {
  east: number,
  north: number,
  south: number,
  west: number
}

type Props = {
  clearComparisonProject: () => void,
  comparisonDestinationTravelTimeDistribution?: Quintiles,
  comparisonIsochrone: any,
  comparisonProjectId?: string,
  comparisonVariant?: number,
  createRegionalAnalysis: any => void,
  currentProject?: any,
  destination: LonLat,
  destinationTravelTimeDistribution?: Quintiles,
  downloadComparisonIsochrone: () => void,
  downloadIsochrone: () => void,
  fetchTravelTimeSurface: (asGeoTIFF?: boolean) => void,
  isFetchingIsochrone: boolean,
  isochrone: any,
  isochroneFetchStatusMessage?: string,
  loadAllRegionalAnalyses: (regionId: string) => void,
  profileRequest: ProfileRequest,
  profileRequestHasChanged: boolean,
  projects: Array<{
    _id: string,
    name: string,
    variants: string[]
  }>,

  push: (string) => void,
  regionBounds?: Bounds,
  regionId: string,
  regionalAnalyses: Array<Bounds & {
      _id: string,
      height: number,
      name: string,
      width: number,
      zoom: number
    }>,
  regionalAnalysisBounds?: Bounds,
  removeDestination: () => void,
  scenarioApplicationErrors?: any[],
  scenarioApplicationWarnings?: any[],
  setComparisonProject: () => void,
  setCurrentProject: (projectId: string) => void,
  setDestination: (any) => void,
  setProfileRequest: (profileRequestFields: any) => void
}

type State = {
  creatingRegionalAnalysis: boolean,
  regionalAnalysisName: void | string,
  showBoundsEditor: boolean
}

const isochroneStyle = (fillColor) => ({
  fillColor,
  opacity: 0.65,
  pointerEvents: 'none',
  stroke: false
})

export default class SinglePointAnalysis extends React.PureComponent<Props, State> {
  state = {
    creatingRegionalAnalysis: false,
    regionalAnalysisName: undefined,
    showBoundsEditor: false
  }

  componentDidMount () {
    const p = this.props
    if (p.regionalAnalyses.length === 0) p.loadAllRegionalAnalyses(p.regionId)
    this._setProfileRequestLonLat()
  }

  componentDidUpdate () {
    this._setProfileRequestLonLat()
  }

  _setProfileRequestLonLat () {
    const p = this.props
    if (p.regionBounds && (!p.profileRequest.fromLat || !p.profileRequest.fromLon)) {
      const {north, south, east, west} = p.regionBounds
      p.setProfileRequest({
        fromLat: (north + south) / 2,
        fromLon: (east + west) / 2
      })
    }
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

  _setCurrentProject = (option: ReactSelectResult) => {
    this.props.setCurrentProject(option.value)
  }

  _setCurrentVariant = (option: ReactSelectResult) => {
    this.props.setProfileRequest({variantIndex: parseInt(option.value)})
  }

  _downloadGeoTIFFs = () => {
    if (this._readyToFetch()) this.props.fetchTravelTimeSurface(true)
  }

  _setTravelTimePercentile = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setProfileRequest({travelTimePercentile: Number(e.target.value)})

  _hideBoundsEditor = () =>
    this.setState({showBoundsEditor: false})

  _showBoundsEditor = () =>
    this.setState({showBoundsEditor: true})

  _setBounds = (bounds: Bounds) =>
    this.props.setProfileRequest({bounds})

  _clickMap = (e: MapEvent) => {
    this.props.setDestination(lonlat(e.latlng))
  }

  _dragMarker = (e: Event & {target: MapEvent}) => {
    this.props.setProfileRequest({
      fromLat: e.target._latlng.lat,
      fromLon: e.target._latlng.lng
    })
    if (this._readyToFetch()) this.props.fetchTravelTimeSurface()
  }

  _dblClickMarker = () => {}

  _readyToFetch = () =>
    !!this.props.currentProject

  render () {
    const {
      comparisonIsochrone,
      currentProject,
      downloadComparisonIsochrone,
      downloadIsochrone,
      fetchTravelTimeSurface,
      isFetchingIsochrone,
      isochrone,
      isochroneFetchStatusMessage,
      profileRequest,
      profileRequestHasChanged,
      projects,
      scenarioApplicationErrors,
      scenarioApplicationWarnings,
      regionalAnalyses,
      regionBounds,
      setProfileRequest
    } = this.props
    const p = this.props
    const {creatingRegionalAnalysis} = this.state
    const disableInputs = !currentProject ||
      !!isFetchingIsochrone || !!scenarioApplicationErrors

    const markerPosition = profileRequest.fromLat && profileRequest.fromLon &&
      {lon: profileRequest.fromLon, lat: profileRequest.fromLat}

    return (
      <div>
        <Sidebar />
        <ErrorModal />

        <div className='Fullscreen analysisMode'>
          <Map onClick={this._clickMap}>
            <OpportunityDatasets.components.DotMap />
            <ModificationsMap />

            {isochrone &&
              <GeoJSON
                data={isochrone}
                key={uuid.v4()}
                style={isochroneStyle(profileRequestHasChanged
                  ? colors.STALE_ISOCHRONE_COLOR
                  : colors.PROJECT_ISOCHRONE_COLOR)}
              />}

            {comparisonIsochrone &&
              <GeoJSON
                data={comparisonIsochrone}
                key={uuid.v4()}
                style={isochroneStyle(profileRequestHasChanged
                  ? colors.STALE_ISOCHRONE_COLOR
                  : colors.COMPARISON_ISOCHRONE_COLOR)}
              />}

            <LabelLayer />

            {markerPosition &&
              <Marker
                draggable
                onDblclick={this._dblClickMarker}
                onDragEnd={this._dragMarker}
                position={markerPosition}
              />}

            {p.destination &&
              <DestinationTravelTimeDistribution
                comparisonDistribution={p.comparisonDestinationTravelTimeDistribution}
                destination={p.destination}
                distribution={p.destinationTravelTimeDistribution}
                isFetchingIsochrone={p.isFetchingIsochrone}
                remove={p.removeDestination}
                setDestination={p.setDestination}
              />}

            {this.state.showBoundsEditor &&
              <EditBounds
                bounds={profileRequest.bounds || regionBounds}
                save={this._setBounds}
              />}
          </Map>
        </div>

        <div className='ApplicationDock analysisMode'>
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
              {scenarioApplicationWarnings != null &&
                scenarioApplicationWarnings.length > 0 &&
                <div className='alert alert-warning'>
                  <Collapsible
                    title={
                      <span className='text-warning'>
                        <Icon type='exclamation-circle' />&nbsp;
                        {messages.analysis.warningsInProject}
                      </span>
                    }
                  >
                    <ScenarioApplicationErrors
                      errors={scenarioApplicationWarnings}
                    />
                  </Collapsible>
                </div>}

              {scenarioApplicationErrors != null &&
                scenarioApplicationErrors.length > 0 &&
                <div className='alert alert-danger'>
                  <strong>
                    <Icon type='exclamation-circle' />{' '}
                    {messages.analysis.errorsInProject}
                  </strong>
                  <br />
                  <ScenarioApplicationErrors errors={scenarioApplicationErrors} />
                </div>}

              <div className='row'>
                <Group label={messages.common.project} className='col-xs-6'>
                  <Select
                    clearable={false}
                    disabled={projects.length === 0}
                    options={projects.map((p, index) => ({
                      label: p.name,
                      value: p._id
                    }))}
                    value={currentProject && currentProject._id}
                    onChange={this._setCurrentProject}
                  />
                </Group>
                <Group label={messages.common.scenario} className='col-xs-6'>
                  <Select
                    clearable={false}
                    disabled={isFetchingIsochrone || !currentProject}
                    options={get(currentProject, 'variants', []).map((v, index) => ({
                      label: v,
                      value: index
                    }))}
                    value={profileRequest.variantIndex}
                    onChange={this._setCurrentVariant}
                  />
                </Group>
              </div>

              {this.renderComparisonSelect()}

              <div className='row'>
                <Group label={messages.analysis.grid} className='col-xs-12'>
                  <OpportunityDatasets.components.Selector />
                </Group>
              </div>

              <StackedPercentileSelector />
            </div>

            <div className='block'>
              <ButtonGroup justified>
                <Button
                  disabled={!isochrone}
                  onClick={downloadIsochrone}
                  style='info'
                ><Icon type='download' /> Isochrone as GeoJSON
                </Button>
                <Button
                  disabled={!comparisonIsochrone}
                  onClick={downloadComparisonIsochrone}
                  style='info'
                ><Icon type='download' /> Comparison Isochrone as GeoJSON
                </Button>
              </ButtonGroup>

              <ButtonGroup justified>
                <Button
                  onClick={this._downloadGeoTIFFs}
                  style='info'
                ><Icon type='globe' /> Generate & Download GeoTIFFs
                </Button>
              </ButtonGroup>

              <BookmarkChooser />
              <ProfileRequestEditor
                disabled={disableInputs}
                profileRequest={profileRequest}
                setProfileRequest={setProfileRequest}
              />

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

              <AdvancedSettings
                disabled={disableInputs}
                hideBoundsEditor={this._hideBoundsEditor}
                profileRequest={profileRequest}
                regionalAnalyses={regionalAnalyses}
                regionBounds={regionBounds}
                setProfileRequest={setProfileRequest}
                showBoundsEditor={this._showBoundsEditor}
              />
            </div>
          </InnerDock>
        </div>
      </div>
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

  /**
   * Render the text boxes to choose a comparison project and variant
   */
  renderComparisonSelect () {
    const p = this.props
    const projectOptions = p.projects.map(s => ({value: s._id, label: s.name}))
    const chosenProject = p.projects.find(s => s._id === p.comparisonProjectId)

    const variantOptions = [ // special value -1 indicates no modifications
      {label: messages.analysis.baseline, value: -1},
      ...get(chosenProject, 'variants', []).map((label, value) => ({label, value}))
    ]

    return (
      <div className='row'>
        <Group label={messages.analysis.comparison + ' ' + messages.common.project} className='col-xs-6'>
          <Select
            disabled={p.isFetchingIsochrone}
            name={messages.common.project}
            onChange={this._setComparisonProject}
            options={projectOptions}
            placeholder={messages.analysis.selectComparisonProject}
            value={p.comparisonProjectId}
          />
        </Group>

        <Group label={messages.analysis.comparison + ' ' + messages.common.scenario} className='col-xs-6'>
          <Select
            disabled={!p.comparisonProjectId}
            clearable={false}
            name={messages.common.scenario}
            onChange={this.setComparisonVariant}
            options={variantOptions}
            placeholder={messages.analysis.selectComparisonProjectVariant}
            value={p.comparisonVariant}
          />
        </Group>
      </div>
    )
  }
}

function ScenarioApplicationErrors ({errors}) {
  /** Render any errors that may have occurred applying the project */
  return (
    <div>
      {errors.map((err, idx) => (
        <ScenarioApplicationError error={err} key={`err-${idx}`} />
      ))}
    </div>
  )
}
