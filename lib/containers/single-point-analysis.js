import { connect } from 'react-redux'
import { ISOCHRONE_COMPONENT, OPPORTUNITY_COMPONENT } from '../constants/map'
import { push } from 'react-router-redux'
import SinglePointAnalysis from '../components/analysis'
import {fetchIsochrone, setComparisonScenario, setComparisonInProgress, setIsochroneCutoff, setCurrentIndicator, enterAnalysisMode, exitAnalysisMode, setActiveVariant, clearIsochroneResults, setProfileRequest} from '../actions/analysis'
import {runAnalysis, load as loadRegionalAnalyses} from '../actions/analysis/regional'
import {addComponent, removeComponent} from '../actions/map'

function mapStateToProps (state, params) {
  const {analysis, mapState, scenario, project} = state
  const variantId = parseInt(params.params.variantId)
  const scenarioId = scenario.currentScenario ? scenario.currentScenario.id : null
  return {
    bundleId: scenario.currentBundle ? scenario.currentBundle.id : null,
    isochroneCutoff: analysis.isochroneCutoff || 60,
    isFetchingIsochrone: analysis.isFetchingIsochrone,
    isShowingIsochrone: mapState.components.indexOf(ISOCHRONE_COMPONENT) !== -1,
    isShowingOpportunities: mapState.components.indexOf(OPPORTUNITY_COMPONENT) !== -1,
    // TODO duplicate code below and in containers/isochrone
    isochroneLatLng: analysis.isochroneLatLng || state.mapState.center,
    modifications: scenario.modifications.filter(m => m.variants[variantId]),
    scenarioId,
    variantIndex: variantId,
    variantName: scenario.currentScenario.variants[variantId],
    scenarioName: scenario.currentScenario.name,
    workerVersion: project.currentProject.r5Version,
    accessibility: analysis.accessibility,
    comparisonAccessibility: analysis.comparisonAccessibility,
    indicators: project.currentProject.indicators,
    spectrogramData: analysis.spectrogramData,
    comparisonSpectrogramData: analysis.comparisonSpectrogramData,
    currentIndicator: analysis.currentIndicator,
    projectId: project.currentProject.id,
    scenarios: scenario.scenarios,
    comparisonScenarioId: analysis.comparisonScenarioId,
    comparisonVariant: analysis.comparisonVariant,
    comparisonBundleId: analysis.comparisonBundleId,
    comparisonModifications: analysis.comparisonModifications,
    comparisonInProgress: analysis.comparisonInProgress,
    profileRequest: analysis.profileRequest,
    regionalAnalyses: project.regionalAnalyses != null
      ? project.regionalAnalyses.filter(a => a.scenarioId === scenarioId && a.variant === variantId)
      : undefined,
    scenarioApplicationErrors: analysis.scenarioApplicationErrors
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    fetchIsochrone: (opts) => dispatch(
      fetchIsochrone({
        ...opts,
        next: [addComponent(OPPORTUNITY_COMPONENT), addComponent(ISOCHRONE_COMPONENT)]
      })),
    removeIsochroneLayerFromMap: () => dispatch(removeComponent(ISOCHRONE_COMPONENT)),
    removeOpportunityLayerFromMap: () => dispatch(removeComponent(OPPORTUNITY_COMPONENT)),
    setIsochroneCutoff: (cutoffSec) => dispatch(setIsochroneCutoff(cutoffSec)),
    setCurrentIndicator: (indicator) => dispatch(setCurrentIndicator(indicator)),
    enterAnalysisMode: () => dispatch(enterAnalysisMode()),
    exitAnalysisMode: () => dispatch(exitAnalysisMode()),
    setActiveVariant: (v) => dispatch(setActiveVariant(v)),
    clearIsochroneResults: () => dispatch(clearIsochroneResults()),
    uploadGrid: (projectId) => dispatch(push(`/projects/${projectId}/grids/create`)),
    runAnalysis: (request) => dispatch(runAnalysis(request)),
    setComparisonScenario: ({ id, bundleId }, variantIndex) => dispatch(setComparisonScenario({ id, bundleId, variantIndex })),
    setComparisonInProgress: (comparisonInProgress) => dispatch(setComparisonInProgress(comparisonInProgress)),
    setProfileRequest: (profileRequest) => dispatch(setProfileRequest(profileRequest)),
    loadRegionalAnalyses: (projectId) => dispatch(loadRegionalAnalyses(projectId)),
    selectRegionalAnalysis: (projectId, scenarioId, regionalAnalysisId) =>
      dispatch(push(`/projects/${projectId}/scenarios/${scenarioId}/analysis/regional/${regionalAnalysisId}`))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePointAnalysis)
