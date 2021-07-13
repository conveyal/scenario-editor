import {useEffect} from 'react'
import {FeatureGroup} from 'react-leaflet'

import {EditControl} from 'lib/components/map/leaflet-draw'

/**
 * Common options for `leaflet-draw`. Note: requires being wrapped in a
 * `FeatureGroup`.
 */
export default function DrawPolygon(p: {
  activateOnMount?: boolean
  onPolygon: (polygon: GeoJSON.Polygon) => void
}) {
  // On component mount
  useEffect(() => {
    if (p.activateOnMount) {
      // this is not the react way of doing things, but it is the most upvoted
      // answer on GIS StackExchange:
      // https://gis.stackexchange.com/questions/238528/how-to-enable-a-leaflet-draw-tool-programatically
      const polygonButton = document.querySelector('.leaflet-draw-draw-polygon')
      if (polygonButton instanceof HTMLButtonElement) polygonButton.click()
    }
  }, [p.activateOnMount])

  return (
    <FeatureGroup>
      <EditControl
        draw={{
          polyline: false,
          polygon: true,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false
        }}
        position='bottomright'
        onCreated={(e) => p.onPolygon(e.layer.toGeoJSON())}
      />
    </FeatureGroup>
  )
}
