import L from 'leaflet'
import {GridLayer, withLeaflet} from 'react-leaflet'

import 'mapbox-gl-leaflet'

import {MB_TOKEN} from 'lib/constants'

const attribution = `© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>`

class MapBoxGLLayer extends GridLayer {
  shouldComponentUpdate(nextProps) {
    if (nextProps.style !== this.props.style) return true
    return false
  }

  componentDidUpdate() {
    if (this.leafletElement && this.leafletElement._glMap) {
      this.leafletElement._glMap.setStyle(this.props.style)
      this.leafletElement._glMap.resize()
    }
  }

  createLeafletElement(props) {
    if (L.mapboxGL == null) return null
    const glLayer = (window.MapboxGLLayer = L.mapboxGL({
      accessToken: MB_TOKEN,
      attribution,
      interactive: false,
      pane: props.leaflet.map._panes?.tilePane,
      style: props.style
    }))
    return glLayer
  }
}

export default withLeaflet(MapBoxGLLayer)
