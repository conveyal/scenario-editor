// @flow
import Leaflet from 'leaflet'
import ReactLeaflet from 'react-leaflet'

/**
 * A GeoJSON layer that has an onmousedown event that gets added to all layers
 */
export default class GeoJSONMousedown extends ReactLeaflet.GeoJSON {
  _attachLayer = (layer: Leaflet.GeoJSON) => {
    layer.on('mousedown', this._onMousedown)
    layer.on('mouseup', this._onMouseup)
  }

  _detachLayer = (layer: Leaflet.GeoJSON) => {
    layer.off('mousedown', this._onMousedown)
    layer.off('mouseup', this._onMouseup)
  }

  _onMousedown = (e: Leaflet.MouseEvent) => {
    this.props.onMousedown(e)
  }

  _onMouseup = (e: Leaflet.MouseEvent) => {}

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement
      .getLayers()
      .forEach(this._attachLayer)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.leafletElement
      .getLayers()
      .forEach(this._detachLayer)
  }
}
