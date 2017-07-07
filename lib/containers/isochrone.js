import {connect} from 'react-redux'

import {fetchTravelTimeSurface, setIsochroneLonLat, setDestination} from '../actions/analysis'
import {addComponent, removeComponent} from '../actions/map'
import SinglePointAnalysis from '../components/map/isochrone'
import {ISOCHRONE_COMPONENT, DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT} from '../constants/map'
import isochrone from '../selectors/isochrone'
import comparisonIsochrone from '../selectors/comparison-isochrone'
import comparisonInProgress from '../selectors/comparison-in-progress'

function mapStateToProps (state, props) {
  const {analysis, scenario, project, mapState} = state
  return {
    bundleId: scenario.currentBundle.id,
    isFetchingIsochrone: analysis.isFetchingIsochrone,
    isochrone: isochrone(state),
    isochroneCutoff: analysis.isochroneCutoff,
    isochroneLonLat: analysis.isochroneLonLat || state.mapState.center,
    modifications: scenario.modifications.filter(m => m.variants[analysis.activeVariant]),
    workerVersion: project.currentProject.r5Version,
    scenarioId: scenario.currentScenario.id,
    variantIndex: analysis.activeVariant,
    accessibility: analysis.accessibility,
    currentIndicator: analysis.currentIndicator,
    comparisonScenarioId: analysis.comparisonScenarioId,
    comparisonVariant: analysis.comparisonVariant,
    comparisonBundleId: analysis.comparisonBundleId,
    comparisonModifications: analysis.comparisonModifications,
    comparisonIsochrone: comparisonIsochrone(state),
    comparisonInProgress: comparisonInProgress(state),
    isDestinationTravelTimeDistributionComponentOnMap: mapState.components.includes(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT),
    profileRequest: analysis.profileRequest,
    projectId: project.currentProject != null ? project.currentProject.id : null,
    projectBounds: project.currentProject != null ? project.currentProject.bounds : null
  }
}

function mapDispatchToProps (dispatch, props) {
  return {
    fetchTravelTimeSurface: (opts) => dispatch(fetchTravelTimeSurface({ ...opts, dispatch })),
    setIsochroneLonLat: (lonlat) => dispatch(setIsochroneLonLat(lonlat)),
    remove: () => dispatch(removeComponent(ISOCHRONE_COMPONENT)),
    addDestinationTravelTimeDistributionComponentToMap: () => dispatch(addComponent(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT)),
    removeDestinationTravelTimeDistributionComponentFromMap: () => dispatch(removeComponent(DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT)),
    setDestination: (destination) => dispatch(setDestination(destination))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePointAnalysis)
