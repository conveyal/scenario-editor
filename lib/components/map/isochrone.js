// @flow
import lonlat from '@conveyal/lonlat'
import {MapEvent} from 'leaflet'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {Marker} from 'react-leaflet'

import GeoJSON from './geojson'
import colors from '../../constants/colors'

import type {LonLat} from '../../types'

type Props = {
  comparisonInProgress: boolean,
  comparisonIsochrone: any,
  isDestinationTravelTimeDistributionComponentOnMap: boolean,
  isochroneCutoff: number,
  isochroneLonLat: any,
  isochrone: any,
  isochroneIsStale: boolean,

  // actions
  remove: () => void,
  setDestination: () => void,
  addDestinationTravelTimeDistributionComponentToMap: () => void,
  removeDestinationTravelTimeDistributionComponentFromMap: () => void,
  setIsochroneLonLat: (lonlat: LonLat) => void
}

export default class Isochrone extends Component {
  props: Props

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
    const {
      isDestinationTravelTimeDistributionComponentOnMap,
      removeDestinationTravelTimeDistributionComponentFromMap
    } = this.props
    const {map} = this.context
    map.off('click', this.onMapClick)
    if (isDestinationTravelTimeDistributionComponentOnMap) {
      // don't leave dest travel time distribution on map when exiting analysis mode
      removeDestinationTravelTimeDistributionComponentFromMap()
    }
  }

  onMapClick = (e: MapEvent) => {
    const {
      setDestination,
      isDestinationTravelTimeDistributionComponentOnMap,
      addDestinationTravelTimeDistributionComponentToMap
    } = this.props
    // if the destination component is already on the map, don't add it - change destination by
    // dragging destination marker
    if (!isDestinationTravelTimeDistributionComponentOnMap) {
      setDestination(lonlat(e.latlng))
      addDestinationTravelTimeDistributionComponentToMap()
    }
  }

  render () {
    const {
      isochrone,
      isochroneCutoff,
      isochroneLonLat,
      isochroneIsStale,
      comparisonIsochrone,
      comparisonInProgress
    } = this.props
    return (
      <g>
        {isochroneLonLat &&
          <Marker
            draggable
            onDblclick={this._handleDblclick}
            onDragend={this._handleDragend}
            position={isochroneLonLat}
          />}

        {comparisonInProgress &&
          comparisonIsochrone &&
          <GeoJSON
            data={comparisonIsochrone}
            key={`isochrone-comparison-${isochroneCutoff}-${lonlat.toString(isochroneLonLat)}${isochroneIsStale ? '-dim' : ''}`}
            style={{
              fillColor: isochroneIsStale
                ? colors.STALE_ISOCHRONE_COLOR
                : colors.COMPARISON_ISOCHRONE_COLOR,
              opacity: 0.65,
              pointerEvents: 'none',
              stroke: false
            }}
          />}

        {isochrone &&
          <GeoJSON
            data={isochrone}
            key={`isochrone-${isochroneCutoff}-${lonlat.toString(isochroneLonLat)}${isochroneIsStale ? '-dim' : ''}`}
            style={{
              fillColor: isochroneIsStale
                ? colors.STALE_ISOCHRONE_COLOR
                : colors.PROJECT_ISOCHRONE_COLOR,
              opacity: 0.65,
              pointerEvents: 'none',
              stroke: false
            }}
          />}
      </g>
    )
  }

  _handleDragend = (e: Event & {target: MapEvent}) => {
    this.props.setIsochroneLonLat(lonlat(e.target._latlng))
  }

  _handleDblclick = () => {
    this.props.remove()
  }
}
