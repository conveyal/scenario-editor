import lonlat from '@conveyal/lonlat'
import turfDestination from '@turf/destination'
import {Marker, Rectangle, withLeaflet} from 'react-leaflet'

import useOnMount from 'lib/hooks/use-on-mount'
import L from 'lib/leaflet'
import {fromLatLngBounds, toLatLngBounds} from 'lib/utils/bounds'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'

// Zoom to bounds, but don't zoom in too much.
const DEFAULT_MAX_ZOOM = 13

// Expose wrapped with leaflet
export default withLeaflet(EditBounds)

/**
 * Edit bounds on a map. Input/outputs: `bounds { north, south, east, west }`
 */
export function EditBounds({bounds, leaflet, save}) {
  // On initial load, fit the bounds
  useOnMount(() => {
    leaflet.map.fitBounds(toLatLngBounds(bounds), {
      maxZoom: DEFAULT_MAX_ZOOM
    })

    // Handle map repositioning on Geocode events
    function onGeocode(r) {
      if (r.bbox) {
        const [west, south, east, north] = r.bbox
        save({north, south, east, west})
      } else {
        const c1 = turfDestination(r.center, 5, 45)
        const c2 = turfDestination(r.center, 5, -135)
        const [east, north] = c1.geometry.coordinates
        const [west, south] = c2.geometry.coordinates
        const newBounds = {north, south, east, west}
        save(newBounds)
        leaflet.map.fitBounds(toLatLngBounds(newBounds))
      }
    }

    leaflet.map.on('geocode', onGeocode)

    return () => leaflet.map.off('geocode', onGeocode)
  })

  // Use leaflet utilities to generate a new set of boundaries
  const onDragEnd = (oppositeCorner) => (e) => {
    // A wrapped latLng ensures it's lon is between -180 and 180
    const newLatLng = e.target.getLatLng().wrap()
    save(
      fromLatLngBounds(
        new L.LatLngBounds(
          lonlat.toLeaflet(reprojectCoordinates(newLatLng)),
          oppositeCorner
        )
      )
    )
  }

  try {
    const leafletBounds = toLatLngBounds(bounds)
    const ne = leafletBounds.getNorthEast()
    const nw = leafletBounds.getNorthWest()
    const se = leafletBounds.getSouthEast()
    const sw = leafletBounds.getSouthWest()

    return (
      <>
        <Marker draggable onDragEnd={onDragEnd(ne)} position={sw} />
        <Marker draggable onDragEnd={onDragEnd(se)} position={nw} />
        <Marker draggable onDragEnd={onDragEnd(sw)} position={ne} />
        <Marker draggable onDragEnd={onDragEnd(nw)} position={se} />
        <Rectangle bounds={leafletBounds} weight={2} />
      </>
    )
  } catch (e) {
    return null
  }
}
