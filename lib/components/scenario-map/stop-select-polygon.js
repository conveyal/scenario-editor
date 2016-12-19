/** Select stops using a polygon select */

import {PropTypes} from 'react'
import {MapControl} from 'react-leaflet'
import inside from 'turf-inside'
import point from 'turf-point'

import DrawPolygon from './draw-polygon'

export default class StopSelectPolygon extends MapControl {
  static propTypes = {
    action: PropTypes.string.isRequired,
    modification: PropTypes.object.isRequired,
    replaceModification: PropTypes.func.isRequired,
    routeStops: PropTypes.array.isRequired,
    setMapState: PropTypes.func.isRequired
  }

  componentWillMount () {
    this.leafletElement = new DrawPolygon(this.doSelect)
  }

  doSelect = (polygon) => {
    const {action, modification, replaceModification, routeStops, setMapState} = this.props
    const stops = routeStops.filter((s) => inside(point([s.stop_lon, s.stop_lat]), polygon))
      .map((s) => s.stop_id)

    const mod = Object.assign({}, modification)

    if (action === 'add') mod.stops = [...(new Set([...mod.stops, ...stops]))]
    else if (action === 'new') mod.stops = stops
    else if (action === 'remove') mod.stops = mod.stops.filter((sid) => stops.indexOf(sid) === -1)

    replaceModification(mod)
    setMapState({
      modification: null,
      state: null
    })
  }
}
