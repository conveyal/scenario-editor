// @flow
import React, {Component} from 'react'
import {Map as LeafletMap, TileLayer} from 'react-leaflet'
import {Browser, LatLngBounds} from 'leaflet'

import tryCatchRender from '../try-catch-render'
import messages from '../../utils/messages'

type Props = {
  bounds: LatLngBounds,
  children?: any,
  height?: number,
  width?: number
}

const TILE_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

const LABEL_URL = Browser.retina && process.env.LABEL_RETINA_URL
  ? process.env.LABEL_RETINA_URL
  : process.env.LABEL_TILE_URL

/**
 * A miniature map used in reports.
 * Comes with a basemap out-of-the-box, and additional react-leaflet elements may be added as children
 * NB the maps do not include attribution, we put it on the report as a whole.
 */
class MiniMap extends Component<void, Props, void> {
  render () {
    // TODO auto-rotate map when bounds are significantly north-south
    const {width = 720, height = 200, bounds, children} = this.props

    const scaledWidth = (bounds.getEast() - bounds.getWest()) * Math.cos(bounds.getNorth() * Math.PI / 180)
    const boundsHeight = bounds.getNorth() - bounds.getSouth()

    const rotated = boundsHeight / scaledWidth > 1.2

    // slightly prefer keeping north at the top
    if (!rotated) {
      return <div>
        <div className='MiniMap-northArrow'><i className='fa fa-arrow-up' />&nbsp;{messages.map.northAbbr}</div>
        <Map height={200} width={720} {...this.props}>{children}</Map>
      </div>
    } else {
      return <div style={{width, height}}>
        <div className='MiniMap-northArrow'><i className='fa fa-arrow-left' />&nbsp;{messages.map.northAbbr}</div>
        {/* default rotate origin is at the bottom so translate it back into position   */}
        <div style={{transform: `rotate(-90deg) translate(${width - height}px)`}}>
          <Map height={200} width={720} {...this.props}>{children}</Map>
        </div>
      </div>
    }
  }
}

export default tryCatchRender(MiniMap)

function Map ({bounds, children, height, width}: Props) {
  return <div style={{width: width, height: height}}>
    <LeafletMap bounds={bounds}
      zoomControl={false}
      attributionControl={false}
      keyboard={false}
      dragging={false}
      touchZoom={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      >
      {/* TODO create a style that contains both streets and labels for the report? */}
      <TileLayer url={TILE_URL} />
      <TileLayer url={LABEL_URL} />
      {children}
    </LeafletMap>
  </div>
}
