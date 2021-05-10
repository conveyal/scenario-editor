/**
 * Redux actions related to Single Point Analysis requests.
 */
import get from 'lodash/get'
import snakeCase from 'lodash/snakeCase'
import {createAction} from 'redux-actions'

import message from 'lib/message'

import {
  ANALYSIS_URL,
  FETCH_TRAVEL_TIME_SURFACE,
  TRAVEL_TIME_PERCENTILES
} from 'lib/constants'
import selectProfileRequestLonLat from 'lib/selectors/profile-request-lonlat'
import {activeOpportunityDatasetId} from 'lib/modules/opportunity-datasets/selectors'

import downloadGeoTIFF from 'lib/utils/download-geotiff'

import fetch, {abortFetch, fetchMultiple, FETCH_ERROR} from '../fetch'

import {parseTimesData} from './parse-times-data'
import {storeRequestsSettings, setResultsSettings} from './profile-request'

export const setMaxTripDurationMinutes = createAction(
  'set max trip duration minutes'
)
export const setTravelTimePercentile = createAction(
  'set travel time percentile'
)

export const setIsochroneFetchStatus = createAction(
  'set isochrone fetch status'
)
export const setScenarioApplicationErrors = createAction(
  'set scenario application errors'
)
export const setScenarioApplicationWarnings = createAction(
  'set scenario application warnings'
)
export const setServerError = createAction(FETCH_ERROR)

export const setTravelTimeSurface = createAction('set travel time surface')
export const setComparisonTravelTimeSurface = createAction(
  'set comparison travel time surface'
)

const initializingMsg = message('analysis.fetchStatus.INITIALIZING_CLUSTER')
function createRetry(dispatch) {
  let retryCount = 0
  let seconds = 1
  return (response) =>
    new Promise((resolve) => {
      if (response.status !== 202) return resolve(false)

      // Update the status
      const status = get(response, 'value.message', initializingMsg)
      dispatch(setIsochroneFetchStatus(status))

      // First ten times, wait one second
      if (retryCount < 10) {
        setTimeout(() => {
          retryCount++
          resolve(true)
        }, seconds * 1000)
      } else {
        // Wait `seconds` and try again
        setTimeout(() => {
          if (seconds < 10) seconds += 1
          resolve(true)
        }, seconds * 1000)
      }
    })
}

export const fetchGeoTIFF = (projectName, requestSettings) => (
  dispatch,
  getState
) => {
  dispatch(
    setIsochroneFetchStatus(message('analysis.fetchStatus.PERFORMING_ANALYSIS'))
  )
  const state = getState()
  const fromLonLat = selectProfileRequestLonLat(state)
  return dispatch(
    fetch({
      next: () => setIsochroneFetchStatus(false),
      options: {
        body: {
          ...requestSettings,
          fromLat: fromLonLat.lat,
          fromLon: fromLonLat.lon
        },
        headers: {
          Accept: 'image/tiff'
        },
        method: 'post'
      },
      retry: createRetry(dispatch),
      type: FETCH_TRAVEL_TIME_SURFACE,
      url: ANALYSIS_URL
    })
  )
    .then((r) => r.arrayBuffer())
    .then((data) => {
      downloadGeoTIFF({
        data,
        filename: snakeCase(`conveyal geotiff ${projectName}`) + '.geotiff'
      })
    })
}

// Check if the settings contain a decay function type other than step
const isNotStep = (s) => get(s, 'decayFunction.type', 'step') !== 'step'

/**
 * Handle fetching and constructing the travel time surface and comparison
 * surface and dispatching updates along the way.
 */
export const fetchTravelTimeSurface = () => (dispatch, getState) => {
  const state = getState()
  const copyRequestSettings = get(state, 'analysis.copyRequestSettings')
  const requestsSettings = get(state, 'analysis.requestsSettings', [])

  dispatch(
    setIsochroneFetchStatus(message('analysis.fetchStatus.PERFORMING_ANALYSIS'))
  )

  const fromLonLat = selectProfileRequestLonLat(state)

  // Only calcuate if decay function is not step
  const destinationPointSetIds = []
  const destinationPointSetId = activeOpportunityDatasetId(state)
  if (destinationPointSetId) {
    destinationPointSetIds.push(destinationPointSetId)
  }

  const profileRequests = [
    {
      ...requestsSettings[0],
      fromLat: fromLonLat.lat,
      fromLon: fromLonLat.lon,
      destinationPointSetIds: isNotStep(requestsSettings[0])
        ? destinationPointSetIds
        : [],
      percentiles: TRAVEL_TIME_PERCENTILES
    }
  ]

  if (get(requestsSettings, '[1].projectId') != null) {
    const finalSettings = copyRequestSettings
      ? requestsSettings[0]
      : requestsSettings[1]
    profileRequests.push({
      ...finalSettings,
      fromLat: fromLonLat.lat,
      fromLon: fromLonLat.lon,
      destinationPointSetIds: isNotStep(finalSettings)
        ? destinationPointSetIds
        : [],
      percentiles: TRAVEL_TIME_PERCENTILES,
      projectId: requestsSettings[1].projectId,
      variantIndex: requestsSettings[1].variantIndex
    })
  }

  // Store the request in local storage and to be compared with the results
  dispatch(storeRequestsSettings(profileRequests))

  return dispatch(
    fetchMultiple({
      type: FETCH_TRAVEL_TIME_SURFACE,
      fetches: profileRequests.map((profileRequest) => ({
        url: ANALYSIS_URL,
        options: {
          body: profileRequest,
          method: 'post'
        },
        retry: createRetry(dispatch)
      })),
      next: handleSurface
    })
  ).then(() => {
    dispatch(setResultsSettings(profileRequests))
  })
}

/**
 * Handle cancelling a fetch.
 */
export const cancelFetch = () => [
  abortFetch({type: FETCH_TRAVEL_TIME_SURFACE}),
  setIsochroneFetchStatus(false)
]

export const clearResults = () => [
  setTravelTimeSurface(null),
  setComparisonTravelTimeSurface(null),
  setResultsSettings([])
]

/**
 * Handle response for a travel time surface request.
 */
export const handleSurface = (error, responses) => {
  if (
    responses.status >= 400 ||
    (Array.isArray(responses) && responses.some((r) => r.status >= 400)) ||
    error
  ) {
    if (get(error, 'value.scenarioApplicationWarnings')) {
      return [
        setScenarioApplicationWarnings(null),
        setTravelTimeSurface(null),
        setComparisonTravelTimeSurface(null),
        setIsochroneFetchStatus(false),
        // responses is just the single response when there was an error
        setScenarioApplicationErrors(
          Array.isArray(error.value.scenarioApplicationWarnings)
            ? error.value.scenarioApplicationWarnings
            : [error.value.scenarioApplicationWarnings]
        )
      ]
    } else {
      const errorInfo =
        // R5 may print the stack trace of uncaught errors as a message. Until
        // that's cleaned up in R5, this makes things pretty for the error modal
        error.statusText && error.value.message && !error.value.stackTrace
          ? {
              message: error.statusText,
              stackTrace: error.value.message
            }
          : error
      return setServerError(errorInfo)
    }
  } else if (get(responses, '[0].status') === 202) {
    // response timeout
    return setIsochroneFetchStatus(false)
  }

  const surface = responseToSurface(responses[0].value)
  const comparisonSurface =
    responses.length > 1 ? responseToSurface(responses[1].value) : undefined

  // Log parsed responses for debugging
  console.log('Surface', surface)
  if (comparisonSurface) console.log('Comparison surface', comparisonSurface)

  return [
    setScenarioApplicationErrors(null),
    setScenarioApplicationWarnings([
      ...surface.warnings,
      ...(comparisonSurface ? comparisonSurface.warnings : [])
    ]),
    setTravelTimeSurface(surface),
    setComparisonTravelTimeSurface(comparisonSurface),
    setIsochroneFetchStatus(false)
  ]
}

// exported for testing
export function responseToSurface(response) {
  if (!response) {
    return {
      errors: [{title: 'No response found!'}],
      warnings: []
    }
  }

  if (response[0] && response[0].title) {
    // this is a list of errors from the backend
    return {
      errors: response,
      warnings: []
    }
  }

  return parseTimesData(response)
}
