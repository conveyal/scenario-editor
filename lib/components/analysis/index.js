// @flow
import Icon from '@conveyal/woonerf/components/icon'
import {format} from 'd3-format'
import {Map as LeafletMap} from 'leaflet'
import React, {Component} from 'react'
import Select from 'react-select'
import {sprintf} from 'sprintf-js'

import BookmarkChooser from '../../containers/bookmark-chooser'
import messages from '../../utils/messages'
import Regional from './regional-analysis-selector'
import convertToR5Modification from '../../utils/convert-to-r5-modification'
import {Button} from '../buttons'
import StackedPercentileSelector from './stacked-percentile-selector'
import {Group, Text, Slider} from '../input'
import Collapsible from '../collapsible'
import ProfileRequestEditor from './profile-request-editor'
import ScenarioApplicationError from './scenario-application-error'

import type {
  ClearableReactSelectResult,
  LonLat,
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
  accessibility?: number,
  bundleId: string,
  comparisonAccessibility?: number,
  comparisonBundleId?: string,
  comparisonScenarioId?: string,
  comparisonInProgress: boolean,
  comparisonPercentileCurves?: Array<{}>,
  comparisonModifications: Modification[],
  comparisonVariant: number,
  currentIndicator?: string,
  destinationGrid: string,
  indicators: Array<{
    key: string,
    name: string
  }>,
  isFetchingIsochrone: boolean,
  isochroneCutoff: number,
  isochroneFetchStatusMessage?: string,
  isochroneLonLat?: LonLat,
  isShowingIsochrone: boolean,
  isShowingOpportunities: boolean,
  modifications: Modification[],
  profileRequest: ProfileRequest,
  projectId: string,
  projectBounds: Bounds,
  regionalAnalyses?: Array<Bounds & {
    id: string,
    name: string,
    height: number,
    width: number,
    zoom: number
  }>,
  regionalAnalysisBounds?: Bounds,
  scenarioApplicationErrors?: Array<{}>,
  scenarioApplicationWarnings?: Array<{}>,
  scenarioId: string,
  scenarioName: string,
  scenarios: Array<{
    id: string,
    name: string,
    variants: string[]
  }>,
  percentileCurves?: Array<{}>,
  variantIndex: number,
  variantName: string,
  variants: string[],
  workerVersion: string,

  addEditRegionalAnalysisBoundsLayerToMap(): void,
  addIsochroneLayerToMap(): void,
  addOpportunityLayerToMap(): void,
  clearIsochroneResults(): void,
  clearComparisonScenario(): void,
  deleteRegionalAnalysis(): void,
  enterAnalysisMode(): void,
  exitAnalysisMode(): void,
  fetchTravelTimeSurface(): void,
  loadRegionalAnalyses(): void,
  push(string): void,
  removeEditRegionalAnalysisBoundsLayerFromMap(): void,
  removeIsochroneLayerFromMap(): void,
  removeOpportunityLayerFromMap(): void,
  runAnalysis(): void,
  selectRegionalAnalysis(): void,
  setActiveVariant(): void,
  setComparisonScenario(): void,
  setCurrentIndicator(): void,
  setIsochroneCutoff(): void,
  setProfileRequest(): void,
  setRegionalAnalysisBounds(): void
}

type State = {
  creatingRegionalAnalysis: boolean,
  regionalAnalysisPercentile: number,
  regionalAnalysisName: void | string
}

/**
 * The side panel for single point analysis, including the stacked percentile plot.
 */
export default class SinglePointAnalysis extends Component<void, Props, State> {
  state = {
    creatingRegionalAnalysis: false,
    regionalAnalysisPercentile: 50,
    regionalAnalysisName: undefined
  }

  visible = true

  /** signal the UI to make a wider sidebar for analysis mode */
  componentWillMount () {
    this.props.enterAnalysisMode()
    this.props.setActiveVariant(this.props.variantIndex)
  }

  componentWillUnmount () {
    this.props.exitAnalysisMode()
    if (this.props.isShowingIsochrone) this.props.removeIsochroneLayerFromMap()
    if (this.props.isShowingOpportunities) this.props.removeOpportunityLayerFromMap()
    this.props.clearIsochroneResults()
    // tag this component as having unmounted, so that if additional isochrones come back (generally
    // caused when someone exits analysis mode before the cluster is initialized) they don't get
    // displayed on the map.
    // not using state here because setState is async, so result could come back between unmount and
    // state update: https://facebook.github.io/react/docs/react-component.html#setstate
    this.visible = false
  }

  componentDidMount () {
    const { currentIndicator, indicators } = this.props
    if (currentIndicator || indicators.length > 0) {
      const chosenIndicator = currentIndicator || indicators[0].key
      this.fetchTravelTimeSurface({ chosenIndicator })
    }
  }

  changeIndicator = (e: ReactSelectResult) => {
    const {projectId, setCurrentIndicator} = this.props
    setCurrentIndicator(projectId, e.value)
  }

  /** run a new query */
  runAnalysis = () => {
    const {
      bundleId,
      currentIndicator,
      isochroneCutoff,
      modifications,
      profileRequest,
      regionalAnalysisBounds,
      removeEditRegionalAnalysisBoundsLayerFromMap,
      runAnalysis,
      scenarioId,
      variantIndex,
      workerVersion
    } = this.props

    const {regionalAnalysisName, regionalAnalysisPercentile} = this.state

    removeEditRegionalAnalysisBoundsLayerFromMap()

    if (regionalAnalysisBounds) {
      const {north, south, east, west} = regionalAnalysisBounds

      runAnalysis({
        name: regionalAnalysisName,
        workerVersion,
        bundleId,
        grid: currentIndicator,
        cutoffMinutes: isochroneCutoff,
        travelTimePercentile: regionalAnalysisPercentile,
        scenarioId,
        variant: variantIndex,
        bounds: {
          type: 'Polygon',
          coordinates: [[
            [west, north],
            [east, north],
            [east, south],
            [west, south],
            [west, north]
          ]]
        },
        request: {
          ...profileRequest,
          scenario: {
            modifications: modifications.map(convertToR5Modification)
          }
        }
      })

      this.setState({regionalAnalysisName: undefined, creatingRegionalAnalysis: false})
    }
  }

  setIsochroneCutoff = (chosenCutoff: number) => {
    this.props.setIsochroneCutoff(chosenCutoff)
  }

  setActiveVariant = (option: ReactSelectResult) => {
    const index = parseInt(option.value)
    this.props.setActiveVariant(index)
    this.props.push(`/scenarios/${this.props.scenarioId}/analysis/${index}`)
  }

  fetchTravelTimeSurface = () => {
    const {
      projectId,
      projectBounds,
      scenarioId,
      comparisonInProgress,
      bundleId,
      modifications,
      fetchTravelTimeSurface,
      isochroneLonLat,
      workerVersion,
      variantIndex,
      comparisonVariant,
      comparisonScenarioId,
      comparisonBundleId,
      comparisonModifications,
      profileRequest
    } = this.props

    if (isochroneLonLat) {
      const commonParams = {
        workerVersion,
        projectId,
        bundleId,
        modifications,
        profileRequest: {
          ...profileRequest,
          fromLat: isochroneLonLat.lat,
          fromLon: isochroneLonLat.lon
        }
      }

      const scenario = {
        ...commonParams,
        scenarioId,
        variantIndex,
        modifications,
        bundleId
      }

      const comparison = !comparisonInProgress ? null
        : {
          ...commonParams,
          scenarioId: comparisonScenarioId,
          variantIndex: comparisonVariant,
          modifications: comparisonModifications,
          bundleId: comparisonBundleId
        }

      fetchTravelTimeSurface({scenario, comparison, bounds: projectBounds})
    }
  }

  componentDidUpdate () {
    const {percentileCurves, destinationGrid, isShowingIsochrone, isShowingOpportunities, addIsochroneLayerToMap, addOpportunityLayerToMap} = this.props
    if (this.visible) { // make sure that the component hasn't been unmounted
      if (!isShowingIsochrone && percentileCurves) addIsochroneLayerToMap()
      if (!isShowingOpportunities && destinationGrid) addOpportunityLayerToMap()
    }
  }

  /** show the regional analysis creation name box */
  prepareCreateRegionalAnalysis = () => {
    const {setRegionalAnalysisBounds, projectBounds, addEditRegionalAnalysisBoundsLayerToMap} = this.props
    setRegionalAnalysisBounds(projectBounds)
    addEditRegionalAnalysisBoundsLayerToMap()
    this.setState({creatingRegionalAnalysis: true})
  }

  setRegionalAnalysisName = (e: Event & {target: HTMLInputElement}) =>
    this.setState({regionalAnalysisName: e.target.value})
  setRegionalAnalysisPercentile = (e: Event & {target: HTMLInputElement}) =>
    this.setState({regionalAnalysisPercentile: Number(e.target.value)})

  setRegionalAnalysisBounds = (e: {value: string}) => {
    const { setRegionalAnalysisBounds, projectBounds, regionalAnalyses } = this.props

    if (e.value === '__PROJECT') {
      setRegionalAnalysisBounds(projectBounds)
    } else if (regionalAnalyses) {
      const foundAnalyses = regionalAnalyses.find(r => r.id === e.value)
      if (foundAnalyses) {
        setRegionalAnalysisBounds(webMercatorBoundsToGeographic(foundAnalyses))
      }
    }
  }

  /** Render the results of an analysis */
  renderResults () {
    const {
      comparisonPercentileCurves,
      comparisonScenarioId,
      comparisonVariant,
      scenarios,
      currentIndicator,
      indicators,
      scenarioName,
      variantName,
      isochroneCutoff,
      accessibility,
      comparisonAccessibility,
      comparisonInProgress,
      percentileCurves,
      isFetchingIsochrone
    } = this.props

    const foundIndicator = indicators.find(i => i.key === currentIndicator)
    const indicatorName = foundIndicator
      ? foundIndicator.name
      : undefined

    let comparisonScenarioName

    if (comparisonPercentileCurves) {
      const comparisonScenario = scenarios.find(s => s.id === comparisonScenarioId)
      if (comparisonScenario) {
        // variant -1 indicates no modifications, just use the raw bundle
        const variantName = comparisonVariant >= 0
          ? comparisonScenario.variants[comparisonVariant]
          : messages.analysis.baseline
        comparisonScenarioName = `${comparisonScenario.name}: ${variantName}`
      }
    }

    const commaFormat = format(',d')

    return (
      <div className='block'>
        <p>
          {sprintf(messages.analysis.accessibility, {
            name: `${scenarioName}: ${variantName}`,
            indicator: indicatorName,
            cutoff: isochroneCutoff,
            number: commaFormat(accessibility)
          })}
        </p>

        <p>
          {comparisonInProgress && comparisonAccessibility != null && currentIndicator &&
            sprintf(messages.analysis.accessibility, {
              name: comparisonScenarioName,
              indicator: indicatorName,
              cutoff: isochroneCutoff,
              number: commaFormat(comparisonAccessibility)
            })}
        </p>

        {percentileCurves && <div>
          <StackedPercentileSelector
            percentileCurves={percentileCurves}
            comparisonPercentileCurves={comparisonPercentileCurves}
            scenarioName={`${scenarioName}: ${variantName}`}
            comparisonScenarioName={comparisonScenarioName}
            isochroneCutoff={isochroneCutoff}
            setIsochroneCutoff={this.setIsochroneCutoff}
            indicatorName={indicatorName}
            isFetchingIsochrone={isFetchingIsochrone}
            />
          <br />
        </div>}
      </div>
    )
  }

  render () {
    const {
      accessibility,
      currentIndicator,
      deleteRegionalAnalysis,
      indicators,
      isFetchingIsochrone,
      isochroneFetchStatusMessage,
      loadRegionalAnalyses,
      profileRequest,
      projectId,
      regionalAnalyses,
      scenarioApplicationErrors,
      scenarioApplicationWarnings,
      scenarioId,
      selectRegionalAnalysis,
      setProfileRequest,
      percentileCurves,
      variantIndex,
      variants
    } = this.props

    const { regionalAnalysisName, regionalAnalysisPercentile, creatingRegionalAnalysis } = this.state

    return (
      <div>
        <div className='block'>
          <br />
          {scenarioApplicationWarnings != null && scenarioApplicationWarnings.length > 0 &&
            <div className='alert alert-warning'>
              <Collapsible
                title={<span className='text-warning'>
                  <Icon type='exclamation-circle' />&nbsp;
                  {messages.analysis.warningsInScenario}
                </span>}>
                <ScenarioApplicationErrors errors={scenarioApplicationWarnings} />
              </Collapsible>
            </div>
          }

          {scenarioApplicationErrors != null && scenarioApplicationErrors.length > 0 &&
            <div className='alert alert-danger'>
              <strong><Icon type='exclamation-circle' /> {messages.analysis.errorsInScenario}</strong><br />
              <ScenarioApplicationErrors errors={scenarioApplicationErrors} />
            </div>}

          <Group>
            <Select
              options={variants.map((v, index) => ({label: v, value: index}))}
              value={variantIndex}
              onChange={this.setActiveVariant}
              />
          </Group>

          {this.renderComparisonSelect()}

          <Group id='select-analysis-indicator'>
            <Select
              id='select-analysis-indicator'
              name={messages.analysis.opportunityDataset}
              options={indicators.map(({ name, key }) => { return { value: key, label: name } })}
              onChange={this.changeIndicator}
              placeholder={messages.analysis.selectOpportunityDataset}
              value={currentIndicator}
              />
          </Group>

          <Collapsible title={messages.analysis.settings}>
            <BookmarkChooser />
            <ProfileRequestEditor
              profileRequest={profileRequest}
              setProfileRequest={setProfileRequest}
              />
          </Collapsible>

          {isFetchingIsochrone &&
            <div className='alert alert-info'>
              <Icon type='refresh' className={'fa-spin'} /> {messages.analysis.fetchStatus[isochroneFetchStatusMessage]}
            </div>}

          {!isFetchingIsochrone && !scenarioApplicationErrors &&
            <Group>
              <Button
                block
                onClick={this.fetchTravelTimeSurface}
                style='primary'
                ><Icon type='refresh' /> {messages.analysis.refresh}
              </Button>
            </Group>}
        </div>

        {accessibility != null && currentIndicator && percentileCurves && this.renderResults()}

        <div className='DockTitle'>{messages.analysis.regionalAnalyses}</div>
        <div className='block'>
          {percentileCurves && !creatingRegionalAnalysis &&
            <Group>
              <Button style='success' block onClick={this.prepareCreateRegionalAnalysis}>
                <Icon type='plus' />{messages.analysis.newRegionalAnalysis}
              </Button>
            </Group>
          }

          {percentileCurves && creatingRegionalAnalysis &&
            <form>
              <Text
                value={regionalAnalysisName}
                label={messages.analysis.regionalAnalysisName}
                onChange={this.setRegionalAnalysisName}
                />
              {this.renderRegionalAnalysisBoundsSelector()}

              {/*
                * A slider for selecting the percentile to use in a regional analysis.
                * This will eventually be moved into analysis settings once we can calculate multiple
                * percentiles in single point mode.
                */}
              <Slider
                value={regionalAnalysisPercentile}
                output
                format='.1f'
                min={1}
                max={99}
                step={1}
                label={messages.analysis.travelTimePercentile}
                onChange={this.setRegionalAnalysisPercentile}
              />

              <Button
                block
                type='submit'
                style='success'
                onClick={this.runAnalysis}
                disabled={regionalAnalysisName == null || regionalAnalysisName === ''}
                aria-label={messages.analysis.startRegionalAnalysis}
                >
                <Icon type='check' /> {messages.analysis.startRegionalAnalysis}
              </Button>
            </form>
          }

          <Regional
            scenarioId={scenarioId}
            projectId={projectId}
            regionalAnalyses={regionalAnalyses}
            loadRegionalAnalyses={loadRegionalAnalyses}
            selectRegionalAnalysis={selectRegionalAnalysis}
            deleteRegionalAnalysis={deleteRegionalAnalysis}
            />
        </div>
      </div>
    )
  }

  /** Render the dropdown box that allows selecting regional analysis bounds */
  renderRegionalAnalysisBoundsSelector () {
    const {regionalAnalysisBounds, projectBounds, regionalAnalyses} = this.props

    if (!regionalAnalysisBounds || !regionalAnalyses) return null

    // figure out which is selected
    let selected
    if (boundsEqual(regionalAnalysisBounds, projectBounds)) {
      selected = '__PROJECT' // special value
    } else {
      const selectedAnalysis = regionalAnalyses
        .find(r => boundsEqual(webMercatorBoundsToGeographic(r), regionalAnalysisBounds))

      if (selectedAnalysis != null) selected = selectedAnalysis.id
      else selected = '__CUSTOM'
    }

    const options = [
      { value: '__PROJECT', label: messages.analysis.regionalBoundsProject },
      ...regionalAnalyses.map(({name, id}) =>
        ({ value: id, label: sprintf(messages.analysis.regionalBoundsSame, name) }))
    ]

    if (selected === '__CUSTOM') {
      // Don't allow the user to select 'Custom' - to make custom bounds, just drag the map markers
      options.push({
        value: '__CUSTOM',
        label: messages.analysis.regionalBoundsCustom,
        disabled: true
      })
    }

    return <Group label={messages.analysis.regionalBounds}>
      <Select
        value={selected}
        options={options}
        onChange={this.setRegionalAnalysisBounds}
      />
    </Group>
  }

  setComparisonScenario = (e: ClearableReactSelectResult) => {
    const {clearComparisonScenario, scenarios, setComparisonScenario} = this.props
    if (e) {
      // reset variant to the baseline
      const scenario = scenarios.find(s => s.id === e.value)
      setComparisonScenario(scenario, -1)
    } else {
      clearComparisonScenario()
    }
  }

  setComparisonVariant = (e: ReactSelectResult) => {
    const { scenarios, comparisonScenarioId, setComparisonScenario } = this.props
    const scenario = scenarios.find(s => s.id === comparisonScenarioId)
    setComparisonScenario(scenario, e.value)
  }

  /** render the text boxes to choose a comparison scenario and variant */
  renderComparisonSelect () {
    const {scenarios, comparisonScenarioId, comparisonVariant} = this.props

    const scenarioOptions = scenarios.map(s => { return { value: s.id, label: s.name } })
    const chosenScenario = scenarios.find(s => s.id === comparisonScenarioId)

    const variantOptions = chosenScenario != null
      ? [
        // special value -1 indicates no modifications
        { label: messages.analysis.baseline, value: -1 },
        ...chosenScenario.variants.map((label, value) => { return { label, value } })
      ]
      : []

    return (
      <div>
        <Group>
          <Select
            name={messages.common.scenario}
            onChange={this.setComparisonScenario}
            options={scenarioOptions}
            placeholder={messages.analysis.selectComparisonScenario}
            value={comparisonScenarioId}
            />
        </Group>

        {comparisonScenarioId && <Group>
          <Select
            clearable={false}
            name={messages.common.variant}
            onChange={this.setComparisonVariant}
            options={variantOptions}
            placeholder={messages.analysis.selectComparisonScenarioVariant}
            value={comparisonVariant}
            />
        </Group>}
      </div>
    )
  }
}

function ScenarioApplicationErrors ({errors}) {
  /** Render any errors that may have occurred applying the scenario */
  return (
    <div>
      {errors.map((err, idx) =>
        <ScenarioApplicationError error={err} key={`err-${idx}`} />)}
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
  const nw = LeafletMap.prototype.unproject([west, north], zoom)
  const se = LeafletMap.prototype.unproject([west + width, north + height], zoom)
  return {
    north: nw.lat,
    south: se.lat,
    east: se.lng,
    west: nw.lng
  }
}

function boundsEqual (b0, b1, epsilon = 1e-6) {
  return Math.abs(b0.north - b1.north) < epsilon &&
    Math.abs(b0.west - b1.west) < epsilon &&
    Math.abs(b0.east - b1.east) < epsilon &&
    Math.abs(b0.south - b1.south) < epsilon
}
