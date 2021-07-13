import pointInPolygon from '@turf/boolean-point-in-polygon'
import {point} from '@turf/helpers'
import uniq from 'lodash/uniq'

import DrawPolygon from './draw-polygon'

/**
 * Select stops using a polygon select
 */
export default function StopSelectPolygon(p: {
  action: 'add' | 'new' | 'remove'
  currentStops: string[]
  stops: GTFS.Stop[]
  update: (stops: string[]) => void
}) {
  function onPolygon(polygon) {
    const selectedStops = p.stops
      .filter((s) => pointInPolygon(point([s.lon, s.lat]), polygon))
      .map((s) => s.id)

    switch (p.action) {
      case 'add':
        p.update(uniq([...p.currentStops, ...selectedStops]))
        break
      case 'new':
        p.update(selectedStops)
        break
      case 'remove':
        p.update(p.currentStops.filter((sid) => !selectedStops.includes(sid)))
        break
    }
  }

  return <DrawPolygon activateOnMount onPolygon={onPolygon} />
}
