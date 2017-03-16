import fetch from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'

// cannot use createAction with Error objects as payload:
// https://github.com/acdlite/redux-actions/issues/194
// thus write an action creator from scratch
export const lockUiWithError = (error) => {
  if (error.error) {
    // already correctly formatted
    return {
      type: 'lock ui with error',
      payload: error,
      error: true
    }
  } else if (error.stack) {
    // return the stack trace as the detail
    return {
      type: 'lock ui with error',
      payload: {
        error: error.message,
        detailMessage: error.stack
      },
      error: true
    }
  } else {
    // coerce the object itself to a string
    return {
      type: 'lock ui with error',
      payload: { error },
      error: true
    }
  }
}

// bundle
export const addBundle = createAction('add bundle')
export const deleteBundle = (id) => [deleteBundleLocally(id), deleteBundleOnServer(id)]
const deleteBundleLocally = createAction('delete bundle')
const deleteBundleOnServer = (id) =>
  fetch({
    url: `/api/bundle/${id}`,
    options: {
      method: 'delete'
    },
    next: (error) => error && lockUiWithError(error.value)
  })
export const saveBundle = (bundle) => [setBundle(bundle), saveBundleToServer(bundle)]
const saveBundleToServer = (bundle) =>
  fetch({
    url: `/api/bundle/${bundle.id}`,
    options: {
      method: 'put',
      body: bundle
    },
    next: (error) => error && lockUiWithError(error.value)
  })
export const setBundle = createAction('set bundle')
export const setBundles = createAction('set bundles')

// feed
/** Update the data pulled in from the GTFS feed */
export const setFeeds = createAction('set feeds')

// login / logout
export const login = createAction('log in')
export const logout = createAction('log out')

// map state
export const setActiveTrips = createAction('set active trips')
export const setMapState = createAction('set map state')
export const setUser = createAction('set user')
