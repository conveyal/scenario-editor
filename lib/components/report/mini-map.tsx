import {LatLngBoundsExpression} from 'leaflet'
import {Map as LeafletMap} from 'react-leaflet'

import BaseMap from '../map/base-map'

/**
 * A miniature map used in reports. Comes with a basemap out-of-the-box, and
 * additional react-leaflet elements may be added as children. The maps do not
 * include attribution, we put it on the report as a whole.
 */
export default function Map({
  bounds,
  children,
  height = 200,
  width = 720
}: {
  bounds: LatLngBoundsExpression
  children: React.ReactNode
  height?: number
  width?: number
}) {
  return (
    <div style={{width: width, height: height}}>
      <LeafletMap
        bounds={bounds}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
      >
        <BaseMap />
        {children}
      </LeafletMap>
    </div>
  )
}
