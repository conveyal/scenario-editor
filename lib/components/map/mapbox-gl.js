import L from 'leaflet'
import {} from 'mapbox-gl-leaflet'
import {GridLayer, withLeaflet} from 'react-leaflet'

const accessToken = process.env.MAPBOX_ACCESS_TOKEN
const attribution = `© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>`
const defaultStyle = 'mapbox/light-v10'
const getStyle = (style = defaultStyle) => `mapbox://styles/${style}`

class MapBoxGLLayer extends GridLayer {
  componentDidUpdate() {
    if (this.leafletElement && this.leafletElement._glMap) {
      this.leafletElement._glMap.resize()
    }
  }

  createLeafletElement(props) {
    const glLayer = (window.MapboxGLLayer = L.mapboxGL({
      accessToken,
      attribution,
      interactive: false,
      pane: props.leaflet.map._panes.tilePane,
      style: getStyle(props.style)
    }))
    return glLayer
  }
}

export default withLeaflet(MapBoxGLLayer)
