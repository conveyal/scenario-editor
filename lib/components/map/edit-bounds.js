// @flow
import {LatLng, LatLngBounds, MapEvent} from 'leaflet'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {Marker, Rectangle} from 'react-leaflet'

import type {Bounds} from '../../types'

/** Edit bounds on a map */
export default class EditBounds extends Component<Props, State> {
  props: {
    bounds: Bounds,
    save: (bounds: Bounds) => void
  }

  static contextTypes = {
    map: PropTypes.object
  }

  componentDidMount () {
    const {map} = this.context
    map.fitBounds([this.sw(), this.ne()], {maxZoom: 13})
  }

  ne () {
    const {bounds} = this.props
    const {north, east} = bounds
    return [north, east]
  }

  nw () {
    const {bounds} = this.props
    const {north, west} = bounds
    return [north, west]
  }

  sw () {
    const {bounds} = this.props
    const {south, west} = bounds
    return [south, west]
  }

  se () {
    const {bounds} = this.props
    const {south, east} = bounds
    return [south, east]
  }

  saveBounds = (bounds: LatLngBounds) => {
    const {save} = this.props

    if (bounds.getWest() < -180) {
      bounds = new LatLngBounds(new LatLng(bounds.getSouth(), -180), this.ne())
    }

    if (bounds.getEast() > 180) {
      bounds = new LatLngBounds(new LatLng(bounds.getSouth(), 180), this.ne())
    }

    save({
      north: bounds.getNorth(),
      east: bounds.getEast(),
      south: bounds.getSouth(),
      west: bounds.getWest()
    })
  }

  onSwDragEnd = (e: Event & {target: MapEvent}) => {
    this.saveBounds(new LatLngBounds(e.target.getLatLng(), this.ne()))
  }

  onNeDragEnd = (e: Event & {target: MapEvent}) => {
    this.saveBounds(new LatLngBounds(e.target.getLatLng(), this.sw()))
  }

  onSeDragEnd = (e: Event & {target: MapEvent}) => {
    this.saveBounds(new LatLngBounds(e.target.getLatLng(), this.nw()))
  }

  onNwDragEnd = (e: Event & {target: MapEvent}) => {
    this.saveBounds(new LatLngBounds(e.target.getLatLng(), this.se()))
  }

  render () {
    const {bounds} = this.props
    if (!bounds) return null
    const sw = this.sw()
    const ne = this.ne()
    const nw = this.nw()
    const se = this.se()
    return (
      <g>
        <Marker draggable onDragEnd={this.onSwDragEnd} position={sw} />
        <Marker draggable onDragEnd={this.onNwDragEnd} position={nw} />
        <Marker draggable onDragEnd={this.onNeDragEnd} position={ne} />
        <Marker draggable onDragEnd={this.onSeDragEnd} position={se} />
        <Rectangle bounds={[sw, ne]} weight={2} />
      </g>
    )
  }
}
