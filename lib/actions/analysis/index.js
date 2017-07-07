import {createGrid} from 'browsochrones'
import lonlat from '@conveyal/lonlat'
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'
import {crc32} from 'crc'
import {Map as LeafletMap} from 'leaflet'
import {createAction} from 'redux-actions'
import {TextDecoder} from 'text-encoding'

import {TRAVEL_TIME_PERCENTILES} from '../../constants/analysis'
import {PERFORMING_ANALYSIS, INITIALIZING_CLUSTER, COMPUTING_ISOCHRONE, statusByPriority} from '../../constants/analysis-status'
import convertToR5Modification from '../../utils/convert-to-r5-modification'
import timeout from '../../utils/timeout'
import {serverAction} from '../network'

const ZOOM = 9
const RETRY_TIMEOUT_MILLSECONDS = 5000

export const clearIsochroneResults = createAction('clear isochrone results')
export const clearComparisonScenario = createAction('clear comparison scenario')
export const enterAnalysisMode = createAction('enter analysis mode')
export const exitAnalysisMode = createAction('exit analysis mode')
export const setActiveVariant = createAction('set active variant')
export const setComparisonModifications = createAction('set comparison modifications')
export const setComparisonScenarioId = createAction('set comparison scenario')
export const setDestination = createAction('set destination')
export const setIsochroneCutoff = createAction('set isochrone cutoff')
export const setIsochroneFetchStatus = createAction('set isochrone fetch status')
export const setIsochroneFetchStatusMessage = createAction('set isochrone fetch status message')
export const setIsochroneLonLat = createAction('set isochrone lonlat', (x) => lonlat(x))
export const setIsochroneResults = createAction('set isochrone results')
export const setProfileRequest = createAction('set profile request')
export const setScenarioApplicationErrors = createAction('set scenario application errors')
export const setScenarioApplicationWarnings = createAction('set scenario application warnings')
export const selectBookmark = createAction('select bookmark')

const setTravelTimeSurface = createAction('set travel time surface')
const setComparisonTravelTimeSurface = createAction('set comparison travel time surface')
const setIndicatorLocally = createAction('set current indicator')
const setDestinationGrid = createAction('set destination grid')

/** Sets the comparison scenario ID, and retrieves that scenario */
export const setComparisonScenario = ({ id, bundleId, variantIndex }) => [
  setComparisonScenarioId({ id, bundleId, variantIndex }),
  serverAction({
    url: `/api/scenario/${id}/modifications`,
    next: async (response) => {
      // return everything to avoid things getting out of sync if multiple requests are made;
      // UI state should always be coherent.
      return setComparisonModifications({
        id,
        bundleId,
        variantIndex,
        // Variant -1 indicates to just use the raw bundle
        modifications: variantIndex === -1 ? [] : (await response.json()).filter(m => m.variants[variantIndex])
      })
    }
  })
]

export const setCurrentIndicator = (projectId, indicator) => fetch({
  // Chrome 57 preserves headers when following redirects, in a departure from previous versions
  // this means the auth header from authenticatedFetch is passed to S3, which causes S3 to fail.
  // Instead we request the URL from the server as JSON and then follow manually
  url: `/api/grid/${projectId}/${indicator}?redirect=false`,
  next: (err, res) => {
    if (!err) {
      return fetch({
        url: res.value.url,
        options: {
          headers: {
            Authorization: null // overwrite default auth header
          }
        },
        next: (error, res) => {
          if (!error) return [setIndicatorLocally(indicator), setDestinationGrid(createGrid(res.value))]
        }
      })
    }
  }
})

export const fetchTravelTimeSurface = ({ scenario, comparison, bounds, dispatch, next }) => [
  setIsochroneFetchStatus(true),
  doTravelTimeSurfaceFetch({ scenario, comparison, bounds, dispatch, next })
]

const doTravelTimeSurfaceFetch = async ({ scenario, comparison, bounds, dispatch, next }) => {
  const nw = LeafletMap.prototype.project([bounds.north, bounds.west], ZOOM)
  const se = LeafletMap.prototype.project([bounds.south, bounds.east], ZOOM)
  const projectedBounds = {
    zoom: 9,
    west: Math.round(nw.x),
    north: Math.round(nw.y),
    // round individually so that we closely preserve the bounds even if the width changes a bit due
    // to rounding error
    width: Math.round(se.x) - Math.round(nw.x),
    height: Math.round(se.y) - Math.round(nw.y)
  }

  const requests = []
  requests.push(buildRequest({...scenario, ...projectedBounds}))
  if (comparison) requests.push(buildRequest({...comparison, ...projectedBounds}))

  const statuses = requests.map(req => PERFORMING_ANALYSIS)

  const updateStatus = s => dispatch(setIsochroneFetchStatusMessage(s))
  updateStatus(PERFORMING_ANALYSIS) // make sure there is a status when the request starts

  const updateFetchStatus = (index, status) => {
    statuses[index] = status

    if (statuses.length === 1) updateStatus(statuses[0])
    else {
      const status0Priority = statusByPriority.findIndex(i => i === statuses[0])
      const status1Priority = statusByPriority.findIndex(i => i === statuses[1])

      if (status0Priority < status1Priority) updateStatus(statuses[0])
      else updateStatus(statuses[1])
    }
  }

  return fetchMultiple({
    fetches: requests.map((body, idx) => ({
      url: '/api/analysis/enqueue/single',
      options: {
        method: 'POST',
        body
      },
      retry: async res => {
        if (res.status === 202) {
          updateFetchStatus(idx, INITIALIZING_CLUSTER)
          await timeout(RETRY_TIMEOUT_MILLSECONDS)
          return true
        } else {
          return false // don't retry
        }
      }
    })),
    next: async (error, responses) => {
      // Errors that are caused by malformed scenarios have status 400 and are specially handled below
      // The default lock ui fetch error action is also disabled for these errors specifically in reducers/network.
      // NB if there is an error this function will be called
      if (error && error.status === 400) {
        return [
          // responses is actually just the single response when there was an error
          setScenarioApplicationErrors(responses.value),
          setScenarioApplicationWarnings(null),
          setTravelTimeSurface(null),
          setComparisonTravelTimeSurface(null),
          setIsochroneFetchStatus(false)
        ]
      } else if (!error) {
        // since we do it for both responses at once we can call updateStatus directly, no need for
        // a call to updateFetchStatus
        updateStatus(COMPUTING_ISOCHRONE)
        let [scenarioSurface, comparisonSurface] = responses.map(i => responseToSurface(i.value))

        if (next) next()

        // One of our clients wanted to compare the nuanced accessibility numbers we produce with
        // the straight line distance metric using average transit travel speed that they currently
        // use (which is, of course, seriously inadvisable). Given that this metric is completely
        // meaningless, rather than add UI to select it (which could be easily discovered by an
        // unsuspecting analyst, leading to a poor transport outcome, billions of dollars of wasted
        // infrastructure spending, lawsuits causing the demise of Conveyal, and the termination of
        // many otherwise well-qualified government beauraucrats), we add a hidden URL parameter.
        // appending ?compareToStraightLineDistance=(speed kmh) will cause all comparisons to be replaced
        // with straight-line distance from the origin.
        const compareToStraightLineDistance = /compareToStraightLineDistance=([0-9.]+)/.exec(window.location.search)
        if (comparisonSurface && compareToStraightLineDistance) {
          const speedKmh = parseFloat(compareToStraightLineDistance[1])
          comparisonSurface = createStraightLineDistanceTravelTimeSurface({
            ...comparisonSurface,
            lat: comparison.profileRequest.fromLat,
            lon: comparison.profileRequest.fromLon,
            speedKmh
          })
        }

        return [
          setScenarioApplicationErrors(null),
          setScenarioApplicationWarnings([
            ...scenarioSurface.warnings,
            ...(comparisonSurface ? comparisonSurface.warnings : [])
          ]),
          setTravelTimeSurface(scenarioSurface),
          setComparisonTravelTimeSurface(comparisonSurface),
          setIsochroneFetchStatus(false),
          // in case multiple requests are enqueued simultaneously, attempt to keep the UI in sync
          setIsochroneLonLat({ lat: scenario.profileRequest.fromLat, lon: scenario.profileRequest.fromLon }),
          setProfileRequest(scenario.profileRequest)
        ]
      }
    }

  })
}

/** Build a request to the analyst backend */
function buildRequest ({ bundleId, scenarioId, variantIndex, modifications, workerVersion, profileRequest, zoom, north, west, width, height }) {
  // ensure scenario reapplication when edited
  const scenarioCrc = crc32(JSON.stringify(modifications))

  return {
    graphId: bundleId,
    workerVersion,
    zoom,
    west,
    north,
    width,
    height,
    percentiles: TRAVEL_TIME_PERCENTILES,
    request: {
      ...profileRequest,
      scenario: {
        id: `${scenarioId}-${variantIndex}-${scenarioCrc}`,
        modifications: modifications.map(convertToR5Modification)
      }
    },
    type: 'travel-time-surface'
  }
}

// exported for testing
export function responseToSurface (response) {
  if (response[0] && response[0].title) {
    // this is a list of errors from the backend
    return {
      errors: response,
      warnings: []
    }
  } else {
    // we must first read the header to figure out how big the binary portion is, then read the full
    // binary portion, then finally read the sidecar metadata at the end.
    const HEADER_LENGTH = 9
    const header = new Int32Array(response, 0, HEADER_LENGTH)
    // validate header and version
    if (intToString(header[0]) + intToString(header[1]) !== 'ACCESSGR') throw new Error('Invalid header in travel time surface')
    if (header[2] !== 0) throw new Error(`Unsupported version ${header[2]} of travel time surface`)
    const zoom = header[3]
    const west = header[4]
    const north = header[5]
    const width = header[6]
    const height = header[7]
    const nSamples = header[8]

    // 9 ints of header, each four bytes wide
    const data = new Int32Array(response, HEADER_LENGTH * 4, width * height * nSamples)

    // de delta code data
    for (let y = 0, pixel = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // pixels are delta coded individually
        for (let sample = 0, val = 0; sample < nSamples; sample++, pixel++) {
          data[pixel] = (val += data[pixel])
        }
      }
    }

    // read metadata
    // TODO cross browser compatibility
    const decoder = new TextDecoder('utf-8') // utf-8 is Jackson default
    const rawMetadata = new Uint8Array(response, (HEADER_LENGTH + width * height * nSamples) * 4)
    const metadata = JSON.parse(decoder.decode(rawMetadata))

    return {
      zoom,
      west,
      north,
      width,
      height,
      nSamples,
      errors: [], // no errors - we got a result
      warnings: metadata.scenarioApplicationWarnings || [],
      get (x, y) {
        const index1d = (y * width + x) * nSamples
        return data.slice(index1d, index1d + nSamples)
      }
    }
  }
}

/** convert a four-byte int to a four-char string */
function intToString (val) {
  return String.fromCharCode(val & 0xff) +
    String.fromCharCode((val >> 8) & 0xff) +
    String.fromCharCode((val >> 16) & 0xff) +
    String.fromCharCode((val >> 24) & 0xff)
}

/**
 * Create a straight-line-distance travel time surface. This is a hidden feature to allow a particular
 * client to demonstrate that straight-line distance _from the origin_ is absurd when used to
 * compute transit access. Yes, people actually do this.
 */
function createStraightLineDistanceTravelTimeSurface ({ zoom, north, west, width, height, nSamples, lat, lon, speedKmh }) {
  const array = new Uint8ClampedArray(nSamples)

  return {
    zoom,
    north,
    west,
    width,
    height,
    nSamples,
    errors: [],
    warnings: [{
      title: `Comparison scenario is using straight line distance with speed ${speedKmh} km/h`,
      messages: []
    }],
    get (x, y) {
      const latlng = LeafletMap.prototype.unproject([x + west, y + north], zoom)
      const distMeters = latlng.distanceTo([lat, lon])
      const timeMinutes = (distMeters / 1000 / speedKmh * 60) | 0

      for (let i = 0; i < nSamples; i++) {
        array[i] = timeMinutes
      }

      return array
    }
  }
}
