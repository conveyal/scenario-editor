/**
 * The side panel for single point analysis, including the spectrogram.
 */

import React, { Component, PropTypes } from 'react'
import Select from 'react-select'
import {sprintf} from 'sprintf-js'
import {format} from 'd3-format'
import messages from '../../utils/messages'
import Histogram from './histogram'
import Regional from './regional-analysis-selector'
import convertToR5Modification from '../../utils/convert-to-r5-modification'
import {Button} from '../buttons'
import SpectrogramSelector from './spectrogram-selector'
import Icon from '../icon'
import {Text, Checkbox} from '../input'
import Collapsible from '../collapsible'
import ProfileRequestEditor from './profile-request-editor'
import ScenarioApplicationError from './scenario-application-error'

export default class SinglePointAnalysis extends Component {
  static propTypes = {
    bundleId: PropTypes.string.isRequired,
    isochroneCutoff: PropTypes.number.isRequired,
    isFetchingIsochrone: PropTypes.bool.isRequired,
    isShowingIsochrone: PropTypes.bool.isRequired,
    isShowingOpportunities: PropTypes.bool.isRequired,
    modifications: PropTypes.array.isRequired,
    scenarioId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    variantIndex: PropTypes.number.isRequired,
    variantName: PropTypes.string.isRequired,
    workerVersion: PropTypes.string.isRequired,
    scenarioName: PropTypes.string.isRequired,
    accessibility: PropTypes.number,
    comparisonAccessibility: PropTypes.number,
    indicators: PropTypes.array.isRequired,
    currentIndicator: PropTypes.string,
    isochroneLatLng: PropTypes.object.isRequired,
    fetchIsochrone: PropTypes.func.isRequired,
    removeIsochroneLayerFromMap: PropTypes.func.isRequired,
    removeOpportunityLayerFromMap: PropTypes.func.isRequired,
    setIsochroneCutoff: PropTypes.func.isRequired,
    setCurrentIndicator: PropTypes.func.isRequired,
    spectrogramData: PropTypes.array,
    comparisonSpectrogramData: PropTypes.array,
    enterAnalysisMode: PropTypes.func.isRequired,
    exitAnalysisMode: PropTypes.func.isRequired,
    setActiveVariant: PropTypes.func.isRequired,
    clearIsochroneResults: PropTypes.func.isRequired,
    uploadGrid: PropTypes.func.isRequired,
    runAnalysis: PropTypes.func.isRequired,
    comparisonBundleId: PropTypes.string,
    comparisonScenarioId: PropTypes.string,
    comparisonVariant: PropTypes.number,
    setComparisonScenario: PropTypes.func.isRequired,
    comparisonInProgress: PropTypes.bool.isRequired,
    setComparisonInProgress: PropTypes.func.isRequired,
    profileRequest: PropTypes.object.isRequired,
    setProfileRequest: PropTypes.func.isRequired,
    loadRegionalAnalyses: PropTypes.func.isRequired,
    selectRegionalAnalysis: PropTypes.func.isRequired,
    scenarioApplicationErrors: PropTypes.array
  }

  state = {}

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
  }

  componentDidMount () {
    const { currentIndicator, indicators } = this.props
    const chosenIndicator = currentIndicator || indicators[0].key

    this.fetchIsochrone({ chosenIndicator })
  }

  changeIndicator = (e) => {
    this.fetchIsochrone({ chosenIndicator: e.value })
  }

  /** run a new query */
  runAnalysis = (e) => {
    const { workerVersion, runAnalysis, modifications, bundleId, currentIndicator, isochroneCutoff, variantIndex, scenarioId, profileRequest } = this.props

    runAnalysis({
      name: this.state.regionalAnalysisName,
      workerVersion,
      bundleId,
      grid: currentIndicator,
      cutoffMinutes: isochroneCutoff,
      scenarioId,
      variant: variantIndex,
      request: {
        ...profileRequest,
        scenario: {
          modifications: modifications.map(convertToR5Modification)
        }
      }
    })

    this.setState({...this.state, regionalAnalysisName: undefined, creatingRegionalAnalysis: false})
  }

  setIsochroneCutoff = (chosenCutoff) => {
    this.fetchIsochrone({ chosenCutoff })
  }

  fetchIsochrone = ({ chosenIndicator, chosenCutoff }) => {
    const {
      projectId,
      scenarioId,
      comparisonInProgress,
      bundleId,
      modifications,
      isochroneCutoff,
      fetchIsochrone,
      isochroneLatLng,
      currentIndicator,
      workerVersion,
      variantIndex,
      comparisonVariant,
      comparisonScenarioId,
      comparisonBundleId,
      comparisonModifications,
      profileRequest
    } = this.props

    // leave comparison params undefined unless we're doing a comparison
    let comparisonParams = comparisonInProgress
      ? {
        comparisonScenarioId: `${comparisonScenarioId}_${comparisonVariant}`,
        comparisonModifications: comparisonModifications,
        comparisonBundleId: comparisonBundleId
      }
      : {}

    fetchIsochrone({
      scenarioId: `${scenarioId}_${variantIndex}`,
      workerVersion,
      projectId,
      bundleId,
      modifications,
      isochroneCutoff: chosenCutoff || isochroneCutoff,
      origin: isochroneLatLng,
      indicator: chosenIndicator || currentIndicator,
      profileRequest,
      ...comparisonParams
    })
  }

  toggleComparison = (e) => this.props.setComparisonInProgress(!this.props.comparisonInProgress)

  /** show the regional analysis creation name box */
  prepareCreateRegionalAnalysis = (e) => this.setState({...this.state, creatingRegionalAnalysis: true})
  setRegionalAnalysisName = (e) => this.setState({...this.state, regionalAnalysisName: e.target.value})

  /** Render the results of an analysis */
  renderResults () {
    const {
      comparisonSpectrogramData,
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
      spectrogramData,
      isFetchingIsochrone
    } = this.props

    const indicatorName = currentIndicator != null ? indicators.find(i => i.key === currentIndicator).name : undefined

    let comparisonScenarioName

    if (comparisonSpectrogramData) {
      const comparisonScenario = scenarios.find(s => s.id === comparisonScenarioId)
      // variant -1 indicates no modifications, just use the raw bundle
      const variantName = comparisonVariant === -1
        ? messages.analysis.baseline
        : comparisonScenario.variants[comparisonVariant]
      comparisonScenarioName = `${comparisonScenario.name}: ${variantName}`
    }

    const commaFormat = format(',d')

    return <div>
      <div>
        {sprintf(messages.analysis.accessibility, {
          name: `${scenarioName}: ${variantName}`,
          indicator: indicatorName,
          cutoff: isochroneCutoff,
          number: commaFormat(accessibility)
        })}
      </div>

      {comparisonInProgress && comparisonAccessibility != null && currentIndicator && <div>
        {sprintf(messages.analysis.accessibility, {
          name: comparisonScenarioName,
          indicator: indicatorName,
          cutoff: isochroneCutoff,
          number: commaFormat(comparisonAccessibility)
        })}
        </div>}

      {spectrogramData && <div>
        <SpectrogramSelector
          spectrogramData={spectrogramData}
          comparisonSpectrogramData={comparisonSpectrogramData}
          scenarioName={`${scenarioName}: ${variantName}`}
          comparisonScenarioName={comparisonScenarioName}
          isochroneCutoff={isochroneCutoff}
          setIsochroneCutoff={this.setIsochroneCutoff}
          indicatorName={indicatorName}
          isFetchingIsochrone={isFetchingIsochrone}
          />

        <Histogram
          data={spectrogramData}
          comparisonData={comparisonSpectrogramData}
          width={600}
          height={250}
          isochroneCutoff={isochroneCutoff}
          isFetchingIsochrone={isFetchingIsochrone}
          />
      </div>}
    </div>
  }

  /** Render any errors that may have occurred applying the scenario */
  renderScenarioApplicationErrors () {
    const { scenarioApplicationErrors } = this.props

    return <div>
      <h3>{messages.analysis.errorsInScenario}</h3>

      {scenarioApplicationErrors.map((err, idx) =>
        <ScenarioApplicationError error={err} key={`err-${idx}`} />)}
    </div>
  }

  render () {
    const {
      currentIndicator,
      indicators,
      comparisonInProgress,
      accessibility,
      variantName,
      projectId,
      scenarioName,
      isFetchingIsochrone,
      uploadGrid,
      scenarioId,
      loadRegionalAnalyses,
      regionalAnalyses,
      profileRequest,
      setProfileRequest,
      selectRegionalAnalysis,
      spectrogramData,
      scenarioApplicationErrors
    } = this.props

    const { regionalAnalysisName, creatingRegionalAnalysis } = this.state

    return <div className='Analysis'>
      <div className='block'>
        {scenarioName}: {variantName}
        <Button
          className={'pull-right'}
          disabled={isFetchingIsochrone}
          onClick={this.fetchIsochrone}>
          <Icon type='refresh' className={isFetchingIsochrone ? 'fa-spin' : ''} />
        </Button>
      </div>

      <Collapsible title={messages.analysis.settings}>
        <ProfileRequestEditor
          profileRequest={profileRequest}
          setProfileRequest={setProfileRequest}
          />
      </Collapsible>

      <div>
        <Select
          name={messages.analysis.indicator}
          value={currentIndicator}
          options={indicators.map(({ name, key }) => { return { value: key, label: name } })}
          onChange={this.changeIndicator}
          width={600}
          />

        <Button className='float-right' title={messages.analysis.newGrid} onClick={e => uploadGrid(projectId)}>
          <Icon type='upload' />
        </Button>
      </div>

      <Checkbox
        label={messages.analysis.compare}
        checked={this.state.comparison}
        onChange={this.toggleComparison}
        />

      {comparisonInProgress && this.renderComparisonSelect()}

      {accessibility != null && currentIndicator && spectrogramData && this.renderResults()}
      {scenarioApplicationErrors != null && scenarioApplicationErrors.length > 0 &&
        this.renderScenarioApplicationErrors()}

      <h3>{messages.analysis.regionalAnalyses}</h3>

      { spectrogramData && !creatingRegionalAnalysis && <Button onClick={this.prepareCreateRegionalAnalysis}>
        <Icon type='plus' />{messages.analysis.newRegionalAnalysis}
      </Button>}

      { spectrogramData && creatingRegionalAnalysis && <form>
        <Text
          value={regionalAnalysisName}
          label={messages.analysis.regionalAnalysisName}
          onChange={this.setRegionalAnalysisName}
          />
        <Button type='submit' onClick={this.runAnalysis} ariaLabel={messages.analysis.startRegionalAnalysis}>
          <Icon type='check' />
        </Button>
      </form> }

      <Regional
        scenarioId={scenarioId}
        projectId={projectId}
        regionalAnalyses={regionalAnalyses}
        loadRegionalAnalyses={loadRegionalAnalyses}
        selectRegionalAnalysis={selectRegionalAnalysis}
        />
    </div>
  }

  setComparisonScenario = (e) => {
    const { scenarios, setComparisonScenario } = this.props
    // reset variant to the baseline
    const scenario = scenarios.find(s => s.id === e.value)
    setComparisonScenario(scenario, -1)
  }

  setComparisonVariant = (e) => {
    const { scenarios, comparisonScenarioId, setComparisonScenario } = this.props
    const scenario = scenarios.find(s => s.id === comparisonScenarioId)
    setComparisonScenario(scenario, e.value)
  }

  /** render the text boxes to choose a comparison scenario and variant */
  renderComparisonSelect () {
    const { scenarios, comparisonScenarioId, comparisonVariant } = this.props

    const scenarioOptions = scenarios.map(s => { return { value: s.id, label: s.name } })
    const chosenScenario = scenarios.find(s => s.id === comparisonScenarioId)
    const variantOptions = chosenScenario != null
      ? [
        // special value -1 indicates no modifications
        { label: messages.analysis.baseline, value: -1 },
        ...chosenScenario.variants.map((label, value) => { return { label, value } })
      ]
      : []

    return <div>
      <Select
        name={messages.common.scenario}
        options={scenarioOptions}
        value={comparisonScenarioId}
        onChange={this.setComparisonScenario}
        />

      <Select
        name={messages.common.variant}
        options={variantOptions}
        value={comparisonVariant}
        onChange={this.setComparisonVariant}
        />
    </div>
  }
}
