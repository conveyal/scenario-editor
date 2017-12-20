/**
 * @flow
 *
 * Redux actions related to Single Point Analysis requests.
 */

import lonlat from '@conveyal/lonlat'
import {fetchError, fetchMultiple} from '@conveyal/woonerf/fetch'
import {Map as LeafletMap} from 'leaflet'
import {createAction} from 'redux-actions'
import {TextDecoder} from 'text-encoding'

import {
  ANALYSIS_URL,
  PROFILE_REQUEST_DEFAULTS,
  TRAVEL_TIME_PERCENTILES
} from '../../constants'
import {
  PERFORMING_ANALYSIS,
  INITIALIZING_CLUSTER,
  COMPUTING_ISOCHRONE
} from '../../constants/analysis-status'
import {saveToServer as saveProject} from '../project'
import selectComparisonInProgress from '../../selectors/comparison-in-progress'
import selectCurrentProject from '../../selectors/current-project'
import selectCurrentProjectId from '../../selectors/current-project-id'
import timeout from '../../utils/timeout'

import R5Version from '../../modules/r5-version'

import type {GetState, LonLat} from '../../types'

const RETRY_TIMEOUT_MILLSECONDS = 5000
const SURFACE_HEADER_LENGTH = 9
const SURFACE_HEADER_TITLE = 'ACCESSGR'

export const clearComparisonProject = createAction('clear comparison project')
export const enterAnalysisMode = createAction('enter analysis mode')
export const exitAnalysisMode = createAction('exit analysis mode')
export const setActiveVariant = createAction('set active variant')

export const setComparisonProject = createAction('set comparison project')
export const setDestination = createAction('set destination')
export const setIsochroneCutoff = createAction('set isochrone cutoff')
export const setIsochroneFetchStatus = createAction(
  'set isochrone fetch status'
)
export const setIsochroneFetchStatusMessage = createAction(
  'set isochrone fetch status message'
)
export const setIsochroneLonLat = createAction('set isochrone lonlat', x =>
  lonlat(x)
)
export const setIsochroneResults = createAction('set isochrone results')
export const setProjectApplicationErrors = createAction(
  'set project application errors'
)
export const setProjectApplicationWarnings = createAction(
  'set project application warnings'
)
export const selectBookmark = createAction('select bookmark')

const setTravelTimeSurface = createAction('set travel time surface')
const setComparisonTravelTimeSurface = createAction(
  'set comparison travel time surface'
)

/**
 * Save the profile request parameters to the project
 */
export const setProfileRequest = createAction('set profile request')
export const setDisplayedProfileRequest = createAction('set displayed profile request')

/**
 * Handle fetching and constructing the travel time surface and comparison
 * surface and dispatching updates along the way.
 */
export const fetchTravelTimeSurface = () =>
  (dispatch: Dispatch, getState: GetState) => {
    dispatch(setIsochroneFetchStatus(PERFORMING_ANALYSIS))

    const state = getState()
    const project = selectCurrentProject(state)
    const currentProjectId = selectCurrentProjectId(state)
    const comparisonInProgress = selectComparisonInProgress(state)
    const workerVersion = R5Version.selectors.selectCurrentR5Version(state, {})

    const compareToStraightLineDistance = /compareToStraightLineDistance=([0-9.]+)/.exec(
      window.location.search
    )

    const profileRequest = {
      ...PROFILE_REQUEST_DEFAULTS,
      ...state.analysis.profileRequest,
      workerVersion,
      percentiles: TRAVEL_TIME_PERCENTILES,
      projectId: currentProjectId
    }

    // Store the profile request settings to the project
    dispatch(setProfileRequest(profileRequest))
    dispatch(saveProject({
      ...project,
      analysisRequestSettings: profileRequest
    }))

    async function retry (response) {
      if (response.status === 202) {
        dispatch(setIsochroneFetchStatusMessage(INITIALIZING_CLUSTER))
        await timeout(RETRY_TIMEOUT_MILLSECONDS)
        return true
      } else {
        return false
      }
    }

    const fetches = [{
      url: ANALYSIS_URL,
      options: {
        method: 'post',
        body: profileRequest
      },
      retry
    }]

    if (comparisonInProgress && !compareToStraightLineDistance) {
      fetches.push({
        url: ANALYSIS_URL,
        options: {
          method: 'post',
          body: {
            ...profileRequest,
            projectId: state.analysis.comparisonProjectId, // override with comparison values
            variantIndex: state.analysis.comparisonVariant
          }
        },
        retry
      })
    }

    dispatch(fetchMultiple({
      fetches,
      next (error, responses) {
        if (error) {
          dispatch([
            setProjectApplicationWarnings(null),
            setTravelTimeSurface(null),
            setComparisonTravelTimeSurface(null),
            setIsochroneFetchStatus(false)
          ])

          // responses is just the single response when there was an error
          if (Array.isArray(responses.value)) {
            dispatch(setProjectApplicationErrors(responses.value))
          } else {
            dispatch(fetchError(responses.value))
          }
        } else {
          dispatch(setIsochroneFetchStatusMessage(COMPUTING_ISOCHRONE))
          const [surface, comparisonSurface] = responses.map(response =>
            responseToSurface(response.value))

          let straightLineSurface = null
          if (compareToStraightLineDistance) {
            const speedKmh = parseFloat(compareToStraightLineDistance[1])
            straightLineSurface = createStraightLineDistanceTravelTimeSurface(
              surface,
              {lon: profileRequest.fromLon, lat: profileRequest.fromLat},
              speedKmh
            )
          }

          return [
            setProjectApplicationErrors(null),
            setProjectApplicationWarnings([
              ...surface.warnings,
              ...(comparisonSurface ? comparisonSurface.warnings : [])
            ]),
            setTravelTimeSurface(surface),
            setComparisonTravelTimeSurface(straightLineSurface || comparisonSurface),
            setIsochroneFetchStatus(false),
            // in case multiple requests are enqueued simultaneously, attempt to keep the UI in sync
            setDisplayedProfileRequest(profileRequest)
          ]
        }
      }
    }))
  }

// exported for testing
export function responseToSurface (response: any): any {
  if (response[0] && response[0].title) {
    // this is a list of errors from the backend
    return {
      errors: response,
      warnings: []
    }
  } else {
    // First read the header to figure out how big the binary portion is, then
    // read the full binary portion, then read the sidecar metadata at the end.
    const header = new Int32Array(response, 0, SURFACE_HEADER_LENGTH)
    // validate header and version
    if (intToString(header[0]) + intToString(header[1]) !== SURFACE_HEADER_TITLE) {
      throw new Error('Invalid header in travel time surface')
    }
    if (header[2] !== 0) {
      throw new Error(`Unsupported version ${header[2]} of travel time surface`)
    }
    const zoom = header[3]
    const west = header[4]
    const north = header[5]
    const width = header[6]
    const height = header[7]
    const nSamples = header[8]

    // 9 ints of header, each four bytes wide
    const data = new Int32Array(
      response,
      SURFACE_HEADER_LENGTH * 4,
      width * height * nSamples
    )

    // de delta code data
    for (let y = 0, pixel = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // pixels are delta coded individually
        for (let sample = 0, val = 0; sample < nSamples; sample++, pixel++) {
          data[pixel] = val += data[pixel]
        }
      }
    }

    // read metadata
    // TODO cross browser compatibility
    const decoder = new TextDecoder('utf-8') // utf-8 is Jackson default
    const rawMetadata = new Uint8Array(
      response,
      (SURFACE_HEADER_LENGTH + width * height * nSamples) * 4
    )
    const metadata = JSON.parse(decoder.decode(rawMetadata))

    return {
      zoom,
      west,
      north,
      width,
      height,
      nSamples,
      errors: [], // no errors - we got a result
      warnings: metadata.projectApplicationWarnings || [],
      get (x: number, y: number) {
        const index1d = (y * width + x) * nSamples
        return data.slice(index1d, index1d + nSamples)
      }
    }
  }
}

/**
 * Convert a four-byte int to a four-char string
 */
function intToString (val) {
  return (
    String.fromCharCode(val & 0xff) +
    String.fromCharCode((val >> 8) & 0xff) +
    String.fromCharCode((val >> 16) & 0xff) +
    String.fromCharCode((val >> 24) & 0xff)
  )
}

/**
 * Create a straight-line-distance travel time surface. This is a hidden feature
 * to allow a particular client to demonstrate that straight-line distance _from
 * the origin_ is absurd when used to compute transit access. Yes, people
 * actually do this.
 */
function createStraightLineDistanceTravelTimeSurface (surface: any, origin: LonLat, speedKmh: number) {
  const array = new Uint8ClampedArray(surface.nSamples)

  return {
    ...surface,
    errors: [],
    warnings: [{
      title: `Comparison project is using straight line distance with speed ${speedKmh} km/h`,
      messages: []
    }],
    get (x, y) {
      const latlng = LeafletMap.prototype.unproject([x + surface.west, y + surface.north], surface.zoom)
      const distMeters = latlng.distanceTo([origin.lat, origin.lon])
      const timeMinutes = (distMeters / 1000 / speedKmh * 60) | 0

      for (let i = 0; i < surface.nSamples; i++) {
        array[i] = timeMinutes
      }

      return array
    }
  }
}
