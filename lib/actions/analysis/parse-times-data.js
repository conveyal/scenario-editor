// @flow
import {TextDecoder} from 'text-encoding'

const CURRENT_VERSION = 0
const HEADER_ENTRIES = 7
const HEADER_LENGTH = 9 // type + entries
const TIMES_GRID_TYPE = 'ACCESSGR'

type TimesData = {
  data: Int32Array,
  depth: number,
  height: number,
  north: number,
  version: number,
  west: number,
  width: number,
  zoom: number
}

/**
 * Parse the ArrayBuffer from a `*_times.dat` file for a point in a network.
 */
export function parseTimesData (ab: ArrayBuffer): TimesData {
  const headerData = new Int8Array(ab, 0, TIMES_GRID_TYPE.length)
  const headerType = String.fromCharCode(...headerData)
  if (headerType !== TIMES_GRID_TYPE) {
    throw new Error(
      `Retrieved grid header ${headerType} !== ${TIMES_GRID_TYPE}. Please check your data.`
    )
  }

  // First read the header to figure out how big the body is, then read the full
  // body, then read the JSON metadata at the end.
  const header = new Int32Array(
    ab,
    2 * Int32Array.BYTES_PER_ELEMENT,
    HEADER_ENTRIES
  )
  const version = header[0]
  // validate header and version
  if (version !== CURRENT_VERSION) {
    throw new Error(`Unsupported version ${version} of travel time surface`)
  }
  const zoom = header[1]
  const west = header[2]
  const north = header[3]
  const width = header[4]
  const height = header[5]
  const depth = header[6]
  const gridSize = width * height

  // skip the header
  const data = new Int32Array(
    ab,
    HEADER_LENGTH * Int32Array.BYTES_PER_ELEMENT,
    gridSize * depth
  )

  // de delta-code
  for (let i = 0, position = 0; i < depth; i++) {
    let previous = 0
    for (let j = 0; j < gridSize; j++, position++) {
      data[position] = data[position] + previous
      previous = data[position]
    }
  }

  const decoder = new TextDecoder('utf-8')
  const rawMetadata = new Uint8Array(
    ab,
    (HEADER_LENGTH + width * height * depth) * Int32Array.BYTES_PER_ELEMENT
  )
  const metadata = JSON.parse(decoder.decode(rawMetadata))

  return {
    version,
    zoom,
    west,
    north,
    width,
    height,
    depth,
    data,
    errors: [],
    warnings: metadata.scenarioApplicationWarnings || [],
    get (x: number, y: number, z: number) {
      return data[(z * gridSize) + y * width + x]
    }
  }
}
