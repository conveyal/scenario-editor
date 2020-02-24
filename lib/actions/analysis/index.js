/**
 * Redux actions related to Single Point Analysis requests.
 */
import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import {createAction} from 'redux-actions'

import message from 'lib/message'

import {
  ANALYSIS_URL,
  FETCH_TRAVEL_TIME_SURFACE,
  PROFILE_REQUEST_DEFAULTS,
  TRAVEL_TIME_PERCENTILES
} from 'lib/constants'
import selectComparisonInProgress from 'lib/selectors/comparison-in-progress'
import selectCurrentProjectId from 'lib/selectors/current-project-id'
import selectProfileRequest from 'lib/selectors/profile-request'
import R5Version from 'lib/modules/r5-version'

import fetch, {fetchMultiple, FETCH_ERROR} from '../fetch'

import {parseTimesData} from './parse-times-data'
import {
  setDisplayedProfileRequest,
  storeProfileRequestSettings
} from './profile-request'

export const clearComparisonProject = createAction('clear comparison project')
export const setActiveVariant = createAction('set active variant')

export const setComparisonProject = createAction('set comparison project')
export const setDestination = createAction('set destination')
export const setIsochroneCutoff = createAction('set isochrone cutoff')
export const setIsochroneFetchStatus = createAction(
  'set isochrone fetch status'
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
export const setServerError = createAction(FETCH_ERROR)
export const selectBookmark = createAction('select bookmark')

export const setTravelTimeSurface = createAction('set travel time surface')
export const setComparisonTravelTimeSurface = createAction(
  'set comparison travel time surface'
)

/**
 * Handle fetching and constructing the travel time surface and comparison
 * surface and dispatching updates along the way.
 */
export const fetchTravelTimeSurface = asGeoTIFF => (dispatch, getState) => {
  const state = getState()

  dispatch(
    setIsochroneFetchStatus(message('analysis.fetchStatus.PERFORMING_ANALYSIS'))
  )

  // Start with the defaults so that we can add new fields that will be included
  // even when the request has been saved for the user.
  const profileRequest = {
    ...PROFILE_REQUEST_DEFAULTS,
    ...selectProfileRequest(state),
    projectId: selectCurrentProjectId(state),
    percentiles: TRAVEL_TIME_PERCENTILES
  }

  // If the worker version hasn't been set, retrieve and set it
  if (profileRequest.workerVersion == null) {
    profileRequest.workerVersion = R5Version.select.currentVersion(state)
  }

  // Previous versions of Analysis (pre v4.0.0) would allow this to be null
  if (profileRequest.travelTimePercentile == null) {
    profileRequest.travelTimePercentile = 50
  }

  // Store the profile request settings locally for the user/region
  dispatch(storeProfileRequestSettings(profileRequest))

  // Double the retry time until it hits 20 seconds
  const initializingMsg = message('analysis.fetchStatus.INITIALIZING_CLUSTER')
  const createRetry = () => {
    let retryCount = 0
    let seconds = 1
    return response =>
      new Promise(resolve => {
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

  // If a GeoTIFF is requested the request can be short-circuited.
  if (asGeoTIFF === true) {
    return dispatch(
      fetch({
        next: () => setIsochroneFetchStatus(false),
        options: {
          body: profileRequest,
          headers: {
            Accept: 'image/tiff'
          },
          method: 'post'
        },
        retry: createRetry(),
        type: FETCH_TRAVEL_TIME_SURFACE,
        url: ANALYSIS_URL
      })
    )
  }

  const fetches = [
    {
      url: ANALYSIS_URL,
      options: {
        body: profileRequest,
        method: 'post'
      },
      retry: createRetry()
    }
  ]

  const comparisonInProgress = selectComparisonInProgress(state)
  if (comparisonInProgress) {
    fetches.push({
      url: ANALYSIS_URL,
      options: {
        body: {
          ...profileRequest,
          projectId: state.analysis.comparisonProjectId, // override with comparison values
          variantIndex: state.analysis.comparisonVariant
        },
        method: 'post'
      },
      retry: createRetry()
    })
  }

  return dispatch(
    fetchMultiple({
      type: FETCH_TRAVEL_TIME_SURFACE,
      fetches,
      next: handleSurface
    })
  ).then(() => {
    dispatch(
      setDisplayedProfileRequest({
        ...profileRequest,
        comparisonProjectId: state.analysis.comparisonProjectId,
        comparisonVariant: state.analysis.comparisonVariant
      })
    )
  })
}

/**
 * Handle response for a travel time surface request.
 */
export const handleSurface = (error, responses) => {
  if (
    responses.status >= 400 ||
    (Array.isArray(responses) && responses.some(r => r.status >= 400)) ||
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
              value: {
                message: error.statusText,
                stackTrace: error.value.message
              }
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
