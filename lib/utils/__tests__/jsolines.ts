import {expect} from '@jest/globals'
import fs from 'fs'
import jsolines, {getContour} from '../jsolines'

const surface: any = new Uint8Array(
  fs.readFileSync(`${__dirname}/surface.dat`).buffer
)

const cutoff = 60
const north = 49616
const west = 33985
const height = 237
const width = 355
const zoom = 9

const params = {
  cutoff,
  height,
  north,
  project([x, y]) {
    return [pixelToLon(x + west, zoom), pixelToLat(y + north, zoom)]
  },
  surface,
  west,
  width
}

describe('jsolines', () => {
  it('get a countour', () => {
    expect(summarizeSnapshot(getContour({...params}))).toMatchSnapshot()
  })

  it('get a jsolines feature', () => {
    expect(summarizeSnapshot(jsolines({...params}))).toMatchSnapshot()
  })

  it('get a jsolines feature without interpolation', () => {
    expect(
      summarizeSnapshot(jsolines({...params, interpolation: false}))
    ).toMatchSnapshot()
  })
})

/** convert pixel value to longitude */
function pixelToLon(x, zoom) {
  return (x / (Math.pow(2, zoom) * 256)) * 360 - 180
}

/** convert pixel value to latitude */
function pixelToLat(y, zoom) {
  const tile = y / 256
  return degrees(
    Math.atan(Math.sinh(Math.PI - (tile * Math.PI * 2) / Math.pow(2, zoom)))
  )
}

/** convert radians to degrees */
function degrees(rad) {
  return (rad * 180) / Math.PI
}

function summarizeSnapshot(s, k?) {
  if (Array.isArray(s) || s instanceof Uint8Array) {
    return {
      [`first${k ? `-${k}` : ''}`]: summarizeSnapshot(s[0]),
      [`last${k ? `-${k}` : ''}`]: summarizeSnapshot(s[s.length - 1]),
      length: s.length
    }
  }
  if (typeof s === 'object') {
    const copy = {...s}
    Object.keys(copy).forEach((k) => {
      copy[k] = summarizeSnapshot(copy[k], k)
    })
    return copy
  }
  if (typeof s === 'number' && !Number.isInteger(s)) {
    return Number(s.toFixed(8)) // precision varies per environment (?)
  }
  return s
}
