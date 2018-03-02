// @flow
import Leaflet from 'leaflet'
import {CircleMarker} from 'react-leaflet'

export default class DraggableCircleMarker extends CircleMarker {
  props: {
    onDragstart?: (Leaflet.MouseEvent) => void,
    onDrag?: (Leaflet.MouseEvent) => void,
    onDragend?: (Leaflet.MouseEvent) => void
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement.on('mousedown', this._mousedown)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.leafletElement.off('mousedown', this._mousedown)
  }

  _mousedown = (e: Leaflet.MouseEvent) => {
    this._moved = false // Check if the mouse moved for "click" events
    this.context.map.on('mousemove', this._mousemove)
    this.context.map.on('mouseup', this._mouseup)
    this.context.map.dragging.disable()
    if (this.props.onDragstart) this.props.onDragstart(e)
  }

  _mousemove = (e: Leaflet.MouseEvent) => {
    this._moved = true
    this.leafletElement.setLatLng(e.latlng)
    if (this.props.onDrag) this.props.onDrag(e)
  }

  _mouseup = (e: Leaflet.MouseEvent) => {
    this.context.map.off('mousemove', this._mousemove)
    this.context.map.off('mouseup', this._mouseup)
    this.context.map.dragging.enable()
    if (this.props.onDragend && this._moved) this.props.onDragend(e)
  }
}
