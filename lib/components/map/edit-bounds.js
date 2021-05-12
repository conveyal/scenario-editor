import lonlat from '@conveyal/lonlat'
import turfDestination from '@turf/destination'
import React from 'react'
import {Rectangle, withLeaflet} from 'react-leaflet'

import Marker from 'lib/components/map/marker'
import useOnMount from 'lib/hooks/use-on-mount'
import L from 'lib/leaflet'
import {fromLatLngBounds, toLatLngBounds} from 'lib/utils/bounds'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'

// Zoom to bounds, but don't zoom in too much.
const DEFAULT_MAX_ZOOM = 13

// Expose wrapped with leaflet
export default withLeaflet(EditBounds)

const round6 = (n) => Math.round(n * 100_000) / 100_000

function roundBbox(bbox) {
  return {
    north: round6(bbox.north),
    south: round6(bbox.south),
    east: round6(bbox.east),
    west: round6(bbox.west)
  }
}

/**
 * Edit bounds on a map. Input/outputs: `bounds { north, south, east, west }`
 */
export function EditBounds(p) {
  // On initial load, fit the bounds
  useOnMount(() => {
    p.leaflet.map.fitBounds(toLatLngBounds(p.bounds), {
      maxZoom: DEFAULT_MAX_ZOOM
    })

    // Handle map repositioning on Geocode events
    function onGeocode(r) {
      if (r.bbox) {
        const [west, south, east, north] = r.bbox
        p.save(roundBbox({north, south, east, west}))
      } else {
        const c1 = turfDestination(r.center, 5, 45)
        const c2 = turfDestination(r.center, 5, -135)
        const [east, north] = c1.geometry.coordinates
        const [west, south] = c2.geometry.coordinates
        const newBounds = roundBbox({north, south, east, west})
        p.save(newBounds)
        p.leaflet.map.fitBounds(toLatLngBounds(newBounds))
      }
    }

    p.leaflet.map.on('geocode', onGeocode)

    return () => p.leaflet.map.off('geocode', onGeocode)
  })

  // Use leaflet utilities to generate a new set of boundaries
  const onDragEnd = (oppositeCorner) => (e) => {
    // A wrapped latLng ensures it's lon is between -180 and 180
    const newLatLng = e.target.getLatLng().wrap()
    p.save(
      roundBbox(
        fromLatLngBounds(
          new L.LatLngBounds(
            lonlat.toLeaflet(reprojectCoordinates(newLatLng)),
            oppositeCorner
          )
        )
      )
    )
  }

  try {
    const leafletBounds = toLatLngBounds(p.bounds)
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
