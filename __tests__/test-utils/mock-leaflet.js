/* globals jest */

import Leaflet from 'leaflet'
import assign from 'lodash.assign'
import uniqueId from 'lodash.uniqueid'

// add a div to jsdom for enzyme to mount to
const div = document.createElement('div')
div.id = 'test'
document.body.appendChild(div)

// mock tile layer urls
process.env.LEAFLET_TILE_URL = 'mock.url/tile'

// implementation for creating leaflet objects
const makeUniqueLeafletIdFn = (prefix) => {
  return () => {
    return {
      _leaflet_id: uniqueId(prefix),
      getLayers: () => [{ on: jest.fn() }],
      bindPopup: jest.fn()
    }
  }
}

// copied from https://github.com/PaulLeCam/react-leaflet/blob/master/__mocks__/leaflet.js
class MapMock extends Leaflet.Map {
  constructor (id, options = {}) {
    super(id, options)  // modified this part, so Map mounts in DOM
    assign(this, Leaflet.Mixin.Events)

    this.options = {...Leaflet.Map.prototype.options, ...options}
    this._container = id

    if (options.bounds) {
      this.fitBounds(options.bounds, options.boundsOptions)
    }

    if (options.maxBounds) {
      this.setMaxBounds(options.maxBounds)
    }

    if (options.center && options.zoom !== undefined) {
      this.setView(Leaflet.latLng(options.center), options.zoom)
    }
  }

  _limitZoom (zoom) {
    const min = this.getMinZoom()
    const max = this.getMaxZoom()
    return Math.max(min, Math.min(max, zoom))
  }

  _resetView (center, zoom) {
    this._initialCenter = center
    this._zoom = zoom
  }

  fitBounds (bounds, options) {
    this._bounds = bounds
    this._boundsOptions = options
  }

  getBounds () {
    return this._bounds
  }

  getCenter () {
    return this._initialCenter
  }

  getMaxZoom () {
    return this.options.maxZoom === undefined ? Infinity : this.options.maxZoom
  }

  getMinZoom () {
    return this.options.minZoom === undefined ? 0 : this.options.minZoom
  }

  getZoom () {
    return this._zoom
  }

  setMaxBounds (bounds) {
    bounds = Leaflet.latLngBounds(bounds)
    this.options.maxBounds = bounds
    return this
  }

  setView (center, zoom) {
    zoom = zoom === undefined ? this.getZoom() : zoom
    this._resetView(Leaflet.latLng(center), this._limitZoom(zoom))
    return this
  }

  setZoom (zoom) {
    return this.setView(this.getCenter(), zoom)
  }
}

// mock these things w/ jest so that it can be verified that
// elements are to be created by react-leaflet
Leaflet.circleMarker = jest.fn(makeUniqueLeafletIdFn('circleMarker'))
Leaflet.geoJson = jest.fn(makeUniqueLeafletIdFn('geoJson'))
Leaflet.marker = jest.fn(makeUniqueLeafletIdFn('marker'))
Leaflet.rectangle = jest.fn(makeUniqueLeafletIdFn('rectangle'))
Leaflet.Map = MapMock
Leaflet.map = (id, options) => new MapMock(id, options)

export default Leaflet

export function drawMock () {
  Leaflet.Draw = {
    Polygon: jest.fn(() => { return { enable: jest.fn(), disable: jest.fn() } })
  }
}
