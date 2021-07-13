import pointInPolygon from '@turf/boolean-point-in-polygon'
import {point} from '@turf/helpers'

import DrawPolygon from './draw-polygon'

/**
 * Select stops using a polygon select
 */
export default function HopSelectPolygon(p: {
  action: 'add' | 'new' | 'remove'
  currentHops: string[][]
  hopStops: GTFS.Stop[][]
  update: (hops: string[][]) => void
}) {
  function onPolygon(polygon: GeoJSON.Polygon) {
    const newHops = p.hopStops
      .filter(
        (hop) =>
          pointInPolygon(point([hop[0].lon, hop[0].lat]), polygon) &&
          pointInPolygon(point([hop[1].lon, hop[1].lat]), polygon)
      )
      .map((hop) => [hop[0].id, hop[1].id])

    switch (p.action) {
      case 'add':
        return p.update([...p.currentHops, ...newHops])
      case 'new':
        return p.update(newHops)
      case 'remove':
        return p.update(
          p.currentHops.filter(
            (c) =>
              newHops.findIndex((n) => c[0] === n[0] && c[1] === n[1]) === -1
          )
        )
    }
  }

  return <DrawPolygon activateOnMount onPolygon={onPolygon} />
}
