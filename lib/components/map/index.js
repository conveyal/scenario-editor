// @flow
import lonlat from '@conveyal/lonlat'
import Leaflet from 'leaflet'
import get from 'lodash/get'
import * as React from 'react'
import {connect} from 'react-redux'
import {Map as LeafletMap, TileLayer} from 'react-leaflet'

import * as select from '../../selectors'
import type {LonLat} from '../../types'

type Props = {
  bounds: Leaflet.LatLngBounds,
  center: LonLat,
  children: React.Children,
  maxBounds: Leaflet.LatLngBounds,
  minZoom: number,
  tileUrl: string,
  zIndex: number,
  zoom: number
}

// prefer to use canvas for rendering, improves speed significantly
// http://leafletjs.com/reference.html#global
// with this on we might be able to get rid of the stop layer
window.L_PREFER_CANVAS = true

const DEFAULT_ZINDEX = -10
const DEFAULT_ZOOM = 12
const MIN_ZOOM = 2
const maxBounds = new Leaflet.LatLngBounds(new Leaflet.LatLng(90, -200), new Leaflet.LatLng(-90, 200))
const TILE_URL = Leaflet.Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

function mapStateToProps (state, ownProps) {
  return {
    bounds: select.modificationBounds(state, ownProps),
    center: get(state, 'mapState.center'),
    zoom: get(state, 'mapState.zoom', DEFAULT_ZOOM)
  }
}

class Map extends React.PureComponent<Props> {
  static defaultProps = {
    tileUrl: TILE_URL,
    zIndex: DEFAULT_ZINDEX,
    minZoom: MIN_ZOOM,
    maxBounds: maxBounds
  }

  state = {
    center: this.props.center
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!lonlat.isEqual(nextProps.center, this.props.center)) {
      this.setState({
        center: nextProps.center
      })
    }
  }

  render () {
    const {bounds, children, tileUrl, zIndex, minZoom, maxBounds, zoom} = this.props
    const {center} = this.state
    return (
      <LeafletMap
        bounds={bounds}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxBounds={maxBounds}
      >
        <TileLayer
          url={tileUrl}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          zIndex={zIndex}
        />

        {children}
      </LeafletMap>
    )
  }
}

export default connect(mapStateToProps)(Map)
