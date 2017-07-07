import lonlat from '@conveyal/lonlat'
import React, {Component, PropTypes} from 'react'
import {Marker} from 'react-leaflet'

import GeoJson from './geojson'
import colors from '../../constants/colors'

export default class Isochrone extends Component {
  static propTypes = {
    bundleId: PropTypes.string.isRequired,
    currentIndicator: PropTypes.string.isRequired,
    comparisonInProgress: PropTypes.bool.isRequired,
    comparisonScenarioId: PropTypes.string,
    comparisonVariant: PropTypes.number,
    comparisonModifications: PropTypes.array,
    comparisonIsochrone: PropTypes.object,
    comparisonBundleId: PropTypes.string,
    isDestinationTravelTimeDistributionComponentOnMap: PropTypes.bool.isRequired,
    isFetchingIsochrone: PropTypes.bool.isRequired,
    isochroneLonLat: PropTypes.object.isRequired,
    isochrone: PropTypes.object,
    modifications: PropTypes.array.isRequired,
    profileRequest: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    projectBounds: PropTypes.object.isRequired,
    scenarioId: PropTypes.string.isRequired,
    variantIndex: PropTypes.number.isRequired,
    workerVersion: PropTypes.string.isRequired,
    // actions
    fetchTravelTimeSurface: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    setDestination: PropTypes.func.isRequired,
    addDestinationTravelTimeDistributionComponentToMap: PropTypes.func.isRequired,
    removeDestinationTravelTimeDistributionComponentFromMap: PropTypes.func.isRequired
  }

  static contextTypes = {
    map: PropTypes.object.isRequired
  }

  componentDidMount () {
    // TODO clooge, handle click actions the way we handle map state
    // maybe just call onClick on every map component if it has an onClick function
    const {map} = this.context
    map.on('click', this.onMapClick)
  }

  componentWillUnmount () {
    const {isDestinationTravelTimeDistributionComponentOnMap, removeDestinationTravelTimeDistributionComponentFromMap} = this.props
    const {map} = this.context
    map.off('click', this.onMapClick)
    if (isDestinationTravelTimeDistributionComponentOnMap) {
      // don't leave dest travel time distribution on map when exiting analysis mode
      removeDestinationTravelTimeDistributionComponentFromMap()
    }
  }

  onMapClick = (e) => {
    const {setDestination, isDestinationTravelTimeDistributionComponentOnMap, addDestinationTravelTimeDistributionComponentToMap} = this.props
    // if the destination component is already on the map, don't add it - change destination by
    // dragging destination marker
    if (!isDestinationTravelTimeDistributionComponentOnMap) {
      setDestination(lonlat(e.latlng))
      addDestinationTravelTimeDistributionComponentToMap()
    }
  }

  render () {
    const {isochrone, isochroneCutoff, isochroneLonLat, comparisonIsochrone, isFetchingIsochrone, comparisonInProgress} = this.props
    return (
      <g>
        <Marker
          draggable
          onDblclick={this._handleDblclick}
          onDragend={this._handleDragend}
          position={isochroneLonLat}
          />

        {comparisonInProgress && comparisonIsochrone &&
          <GeoJson
            data={comparisonIsochrone}
            key={`isochrone-comparison-${isochroneCutoff}-${lonlat.toString(isochroneLonLat)}${isFetchingIsochrone ? '-dim' : ''}`}
            style={{
              fillColor: isFetchingIsochrone
                ? colors.STALE_ISOCHRONE_COLOR
                : colors.COMPARISON_ISOCHRONE_COLOR,
              opacity: 0.65,
              pointerEvents: 'none',
              stroke: false
            }}
          />}

        {isochrone &&
          <GeoJson
            data={isochrone}
            key={`isochrone-${isochroneCutoff}-${lonlat.toString(isochroneLonLat)}${isFetchingIsochrone ? '-dim' : ''}`}
            style={{
              fillColor: isFetchingIsochrone
                ? colors.STALE_ISOCHRONE_COLOR
                : colors.SCENARIO_ISOCHRONE_COLOR,
              opacity: 0.65,
              pointerEvents: 'none',
              stroke: false
            }}
            />}
      </g>
    )
  }

  _fetchIsochrone = (lnglat) => {
    const {
      projectId,
      projectBounds,
      scenarioId,
      comparisonInProgress,
      bundleId,
      modifications,
      fetchTravelTimeSurface,
      workerVersion,
      variantIndex,
      comparisonVariant,
      comparisonScenarioId,
      comparisonBundleId,
      comparisonModifications,
      profileRequest
    } = this.props

    const commonParams = {
      workerVersion,
      projectId,
      bundleId,
      modifications,
      profileRequest: {
        ...profileRequest,
        fromLat: lnglat.lat,
        fromLon: lnglat.lng
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

    fetchTravelTimeSurface({ scenario, comparison, bounds: projectBounds })
  }

  _handleDragend = (e) => {
    this._fetchIsochrone(e.target._latlng)
    this.props.setIsochroneLonLat(e.target._latlng)
  }

  _handleDblclick = (e) => {
    this.props.remove()
  }
}
