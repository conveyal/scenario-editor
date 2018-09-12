/**
 * @flow
 *
 * Redux actions related to Single Point Analysis requests.
 */

import lonlat from '@conveyal/lonlat'
import {fetchError, fetchMultiple} from '@conveyal/woonerf/fetch'
import {Map as LeafletMap} from 'leaflet'
import {createAction} from 'redux-actions'

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
import * as select from '../../selectors'
import downloadGeoTIFF from '../../utils/download-geotiff'
import localStorage from '../../utils/local-storage'
import timeout from '../../utils/timeout'
import R5Version from '../../modules/r5-version'
import type {GetState, LonLat} from '../../types'

import {parseTimesData} from './parse-times-data'

const RETRY_TIMEOUT_MILLSECONDS = 5000

export const clearComparisonProject = createAction('clear comparison project')
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
export const setScenarioApplicationErrors = createAction(
  'set scenario application errors'
)
export const setScenarioApplicationWarnings = createAction(
  'set scenario application warnings'
)
export const selectBookmark = createAction('select bookmark')

const setTravelTimeSurface = createAction('set travel time surface')
const setComparisonTravelTimeSurface = createAction(
  'set comparison travel time surface'
)

/**
 * Save the profile request parameters to local storage
 */
export const setProfileRequest = createAction('set profile request')
export const setDisplayedProfileRequest = createAction('set displayed profile request')

const requestSettingsKey = 'profileRequestSettings'
const getStoredSettings = () => JSON.parse(localStorage.getItem(requestSettingsKey) || '{}')

export const storeProfileRequestSettings = (profileRequest: any) =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = select.currentRegionId(state, {})
    const storedSettings = getStoredSettings()
    storedSettings[regionId] = profileRequest
    localStorage.setItem(requestSettingsKey, JSON.stringify(storedSettings))

    dispatch(setProfileRequest(profileRequest))
  }

export const loadProfileRequestSettings = (regionId: string) => {
  const storedProfileRequestSettings = getStoredSettings()
  const profileRequestSettings = storedProfileRequestSettings[regionId]
  if (profileRequestSettings) {
    return [
      setProfileRequest({
        ...PROFILE_REQUEST_DEFAULTS, // keep this in case we want to add new fields / change the defaults
        ...profileRequestSettings
      }),
      R5Version.actions.setCurrentR5Version(profileRequestSettings.workerVersion)
    ]
  }
}

/**
 * Handle fetching and constructing the travel time surface and comparison
 * surface and dispatching updates along the way.
 */
export const fetchTravelTimeSurface = (asGeoTIFF: boolean) =>
  (dispatch: Dispatch, getState: GetState) => {
    dispatch(setIsochroneFetchStatus(PERFORMING_ANALYSIS))

    const state = getState()
    const project = select.currentProject(state)
    const currentProjectId = select.currentProjectId(state)
    const comparisonInProgress = select.comparisonInProgress(state)
    const comparisonProject = select.comparisonProject(state)
    const workerVersion = R5Version.select.currentR5Version(state, {})

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

    // Store the profile request settings for the user/region
    dispatch(storeProfileRequestSettings(profileRequest))

    async function retry (response) {
      if (response.status === 202) {
        dispatch(setIsochroneFetchStatusMessage(INITIALIZING_CLUSTER))
        await timeout(RETRY_TIMEOUT_MILLSECONDS)
        return true
      } else {
        return false
      }
    }

    const headers = {}
    if (asGeoTIFF === true) {
      headers.Accept = 'image/tiff'
    }

    const fetches = [{
      url: ANALYSIS_URL,
      options: {
        body: profileRequest,
        headers,
        method: 'post'
      },
      retry
    }]

    if (comparisonInProgress && !compareToStraightLineDistance) {
      fetches.push({
        url: ANALYSIS_URL,
        options: {
          body: {
            ...profileRequest,
            projectId: state.analysis.comparisonProjectId, // override with comparison values
            variantIndex: state.analysis.comparisonVariant
          },
          headers,
          method: 'post'
        },
        retry
      })
    }

    dispatch(fetchMultiple({
      fetches,
      next (error, responses) {
        if (error) {
          dispatch([
            setScenarioApplicationWarnings(null),
            setTravelTimeSurface(null),
            setComparisonTravelTimeSurface(null),
            setIsochroneFetchStatus(false)
          ])

          // responses is just the single response when there was an error
          if (Array.isArray(responses.value)) {
            dispatch(setScenarioApplicationErrors(responses.value))
          } else {
            dispatch(fetchError(responses.value))
          }
        } else if (asGeoTIFF === true) {
          downloadGeoTIFF({
            data: responses[0].value,
            filename: `analysis-geotiff-${project ? project.name : ''}-${profileRequest.variantIndex}.geotiff`
          })
          if (comparisonInProgress && responses[1]) {
            downloadGeoTIFF({
              data: responses[1].value,
              filename: `analysis-geotiff-${comparisonProject.name}-${state.analysis.comparisonVariant}.geotiff`
            })
          }
          dispatch(setIsochroneFetchStatus(false))
        } else {
          dispatch(setIsochroneFetchStatusMessage(COMPUTING_ISOCHRONE))

          try {
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
              setScenarioApplicationErrors(null),
              setScenarioApplicationWarnings([
                ...surface.warnings,
                ...(comparisonSurface ? comparisonSurface.warnings : [])
              ]),
              setTravelTimeSurface(surface),
              setComparisonTravelTimeSurface(straightLineSurface || comparisonSurface),
              setIsochroneFetchStatus(false),
              // in case multiple requests are enqueued simultaneously, attempt to keep the UI in sync
              setDisplayedProfileRequest(profileRequest)
            ]
          } catch (e) {
            console.error(e)
            throw e
          }
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
  }

  return parseTimesData(response)
}

/**
 * Create a straight-line-distance travel time surface. This is a hidden feature
 * to allow a particular client to demonstrate that straight-line distance _from
 * the origin_ is absurd when used to compute transit access. Yes, people
 * actually do this.
 */
function createStraightLineDistanceTravelTimeSurface (surface: any, origin: LonLat, speedKmh: number) {
  const array = new Uint8ClampedArray(surface.depth)

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

      for (let i = 0; i < surface.depth; i++) {
        array[i] = timeMinutes
      }

      return array
    }
  }
}
