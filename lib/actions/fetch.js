import isObject from 'lodash/isObject'

import fetch from 'lib/utils/fetch'
import {timer} from 'lib/utils/metric'

// Main actions to be dispatched return promises and can be `await`ed
export const fetchAction = payload => (dispatch, getState) =>
  runFetchAction(payload, dispatch, getState())

export const fetchMultiple = payload => (dispatch, getState) =>
  runFetchMultiple(payload, dispatch, getState())

// Set the default to single fetch
export default fetchAction

// Action types
export const ABORTED_FETCH = 'aborted fetch'
export const ABORT_FETCH_FAILED = 'abort fetch failed'
export const INCREMENT_FETCH = 'increment outstanding fetches'
export const DECREMENT_FETCH = 'decrement outstanding fetches'
export const FETCH = 'fetch'
export const FETCH_MULTIPLE = 'fetch multiple'
export const FETCH_ERROR = 'fetch error'

// ID that gets incremented for each fetch
let FETCH_ID = 0

// Get's the next fetch ID, which can be passed in to `fetch`, and allows for
// tracking the fetch or aborting it.
export const getID = () => ++FETCH_ID

// Generic fetch type
const GFT = '__FETCH__'

// Active fetches, can still be aborted
const activeFetches = {
  [GFT]: []
}

// Remove a fetch from the active pool
const removeFetch = sig => {
  if (sig.type === GFT) {
    activeFetches[GFT].splice(activeFetches[GFT].indexOf(sig.id), 1)
  } else {
    delete activeFetches[sig.type]
  }
}

// Check if a fetch is still active
export const fetchIsActive = sig => {
  if (sig.type === GFT) return activeFetches[GFT].includes(sig.id)
  if (activeFetches[sig.type] === undefined) return false
  if (sig.id === undefined) return true
  return activeFetches[sig.type] === sig.id
}

// Simple action creator
const createAction = type => payload => ({type, payload})

// Internally dispatched actions
const abortedFetch = createAction(ABORTED_FETCH)
const abortFetchFailed = createAction(ABORT_FETCH_FAILED)
const fetchError = createAction(FETCH_ERROR)

/**
 * Call decrement and dispatch "aborted" and "decrement" actions. If `id` is
 * not set, cancel all fetches for the given type.
 */
export const abortFetch = sig => {
  if (fetchIsActive(sig)) {
    return [abortedFetch(sig), decrementFetches(sig)]
  } else {
    return abortFetchFailed(sig)
  }
}

// Abort all active fetches
export const abortAllFetches = () =>
  Object.keys(activeFetches).reduce((aborts, fetchType) => {
    if (fetchType === GFT) {
      return [
        ...aborts,
        ...activeFetches[GFT].map(id => abortFetch({type: GFT, id}))
      ]
    } else {
      return [
        ...aborts,
        abortFetch({type: fetchType, id: activeFetches[fetchType]})
      ]
    }
  }, [])

/**
 * Send an increment action and add the fetch to the active list. This will also
 * abort a previous fetch of the same type if it exists.
 */
export const incrementFetches = payload => {
  const actions = [
    {
      type: INCREMENT_FETCH,
      payload
    }
  ]

  if (payload.type === GFT) activeFetches[GFT].push(payload.id)
  else {
    if (activeFetches[payload.type] !== undefined) {
      actions.push(
        abortFetch({
          type: payload.type,
          id: activeFetches[payload.type]
        })
      )
    }
    activeFetches[payload.type] = payload.id
  }

  return actions
}

/**
 * Send a decrement action and remove the fetch from the active list.
 */
export const decrementFetches = signature => {
  removeFetch(signature)

  return {
    type: DECREMENT_FETCH,
    payload: signature
  }
}

/**
 * Calls fetch, adds Auth and Content header if needed. Automatically parses
 * content based on type.
 *
 * @returns Promise
 */
function runFetch({signature, options = {}, retry = false, url}, state) {
  const headers = {
    ...createAuthorizationHeader(state),
    ...createContentHeader(options.body),
    ...(options.headers || {})
  }

  const filteredHeaders = {}

  // Allow removing generated headers by specifiying { header: null } in
  // options.headers. Do this in two steps because otherwise we're modifying
  // the object as we're iterating over it.
  Object.keys(headers)
    .filter(key => headers[key] !== null && headers[key] !== undefined)
    .forEach(key => {
      filteredHeaders[key] = headers[key]
    })

  return fetch(url, {
    mode: 'cors',
    ...options,
    body: serialize(options.body),
    headers: filteredHeaders
  })
    .then(checkStatus)
    .then(createResponse)
    .then(async response =>
      retry && fetchIsActive(signature) && (await retry(response))
        ? runFetch({signature, options, retry, url}, state)
        : response
    )
}

/**
 * Part of Redux action cycle.
 * @returns Promise
 */
function runFetchAction(
  {type = GFT, id = getID(), next, options = {}, retry = false, url},
  dispatch,
  state
) {
  // Start timer
  const fetchTimer = timer('fetch', {method: options.method || 'get', url})

  // Fetch signature based on the `type` and `id`
  const signature = {type, id}

  // If next does not exist or only takes a response, dispatch on error
  const dispatchFetchError = !next || next.length < 2

  // Increment fetches
  dispatch(incrementFetches({type, id, options, url}))

  // Return a promise that can be `await`ed
  return runFetch({signature, options, retry, url}, state)
    .then(response => {
      fetchTimer.end()

      if (fetchIsActive(signature)) {
        dispatch(decrementFetches(signature))
        if (next) dispatch(wrapNext(next)(response))

        return response.value || response
      }
    })
    .catch(error => {
      fetchTimer.end()

      return createErrorResponse(error).then(response => {
        if (fetchIsActive(signature)) {
          dispatch(decrementFetches(signature))
          if (next && next.length > 1) dispatch(next(error, response))
        }

        if (dispatchFetchError) dispatch(fetchError(response))

        // Rethrow
        throw response
      })
    })
}

/**
 * @returns Promise
 */
function runFetchMultiple(
  {
    type = GFT,
    id = getID(), // One ID for all fetch IDs in a fetch multiple
    fetches,
    next
  },
  dispatch,
  state
) {
  const signature = {type, id}
  const dispatchFetchError = !next || next.length < 2

  // Log and increment
  dispatch(incrementFetches({type, id, fetches}))

  return Promise.all(
    fetches.map(fetch => runFetch({...fetch, signature}, state))
  )
    .then(responses => {
      if (fetchIsActive(signature)) {
        dispatch(decrementFetches(signature))

        if (next) dispatch(wrapNext(next)(responses))

        // Just return the values for Promise based execution
        return responses.map(r => r.value || r)
      }
    })
    .catch(error =>
      createErrorResponse(error).then(response => {
        if (fetchIsActive(signature)) {
          dispatch(decrementFetches(signature))
          if (next && next.length > 1) dispatch(next(error, response))
          if (dispatchFetchError) dispatch(fetchError(response))

          // Rethrow
          throw response
        }
      })
    )
}

function createAuthorizationHeader(state) {
  return state.user && state.user.idToken
    ? {
        Authorization: `bearer ${state.user.idToken}`,
        'X-Conveyal-Access-Group': state.user.adminTempAccessGroup
      }
    : {}
}

function checkStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    throw res
  }
}

const isServer = typeof window === 'undefined'
function createContentHeader(body) {
  if (!isServer && body instanceof window.FormData) {
    return {}
  } else if (isObject(body)) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  } else {
    return {}
  }
}

function createErrorResponse(res) {
  return res.headers ? createResponse(res) : Promise.resolve(res)
}

function createResponse(res) {
  return deserialize(res)
    .then(value => {
      res.value = value
      return res
    })
    .catch(err => {
      res.value = err
      return res
    })
}

async function deserialize(res) {
  const header = `${res.headers.get('Content-Type')} ${res.headers.get(
    'Content'
  )}`
  if (header.indexOf('json') > -1) return res.json()
  if (header.indexOf('octet-stream') > -1) return res.arrayBuffer()
  if (header.indexOf('text') > -1) return res.text()
}

function serialize(body) {
  if (
    !isServer &&
    (body instanceof window.FormData || body instanceof window.Blob)
  ) {
    return body
  } else if (isObject(body)) {
    return JSON.stringify(body)
  } else {
    return body
  }
}

function wrapNext(next) {
  return function(response) {
    if (next.length > 1) {
      return next(null, response)
    } else {
      return next(response)
    }
  }
}
