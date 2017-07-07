import fetch from '@conveyal/woonerf/fetch'
import {push} from 'react-router-redux'
import {createAction} from 'redux-actions'

import {compareR5Versions, RELEASE_VERSION_REGEX} from '../utils/r5-version'
import {R5_BUCKET, MINIMUM_R5_VERSION} from '../constants/analysis'

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
    next: (error) => error && lockUiWithError(error)
  })
export const saveBundle = (bundle) => [setBundle(bundle), saveBundleToServer(bundle)]
const saveBundleToServer = (bundle) =>
  fetch({
    url: `/api/bundle/${bundle.id}`,
    options: {
      method: 'put',
      body: bundle
    },
    next: (error) => error && lockUiWithError(error)
  })
export const setBundle = createAction('set bundle')
export const setBundles = createAction('set bundles')
export const loadBundle = (bundleId) =>
  fetch({
    url: `/api/bundle/${bundleId}`,
    next: (error, response) => !error && setBundle(response.value)
  })

// feed
/** Update the data pulled in from the GTFS feed */
export const setFeeds = createAction('set feeds')

// login / logout
export const login = createAction('log in')
export const logout = () => [createAction('log out'), push('/')]
export const setActiveTrips = createAction('set active trips')
export const setUser = createAction('set user')

// r5 versions
const setR5Versions = createAction('set r5 versions')
export const loadR5Versions = () => fetch({
  url: R5_BUCKET,
  options: {
    headers: {
      Authorization: null
    }
  },
  next: (error, response) => {
    if (!error) {
      const parser = new window.DOMParser()
      const r5doc = parser.parseFromString(response.value, 'application/xml')

      const all = Array.from(r5doc.querySelectorAll('Contents'))
        .map((item) => item.querySelector('Key').childNodes[0].nodeValue) // get just key
        .filter((item) => item !== 'index.html') // don't include the main page
        .map((item) => item.replace(/.jar$/, '')) // and remove .jar
        .filter(item => compareR5Versions(item, MINIMUM_R5_VERSION) >= 0) // remove old, unsupported r5 versions

      // reverse-sort r5 versions, invert comparator
      all.sort((a, b) => -compareR5Versions(a, b))

      const release = all
        .filter(i => RELEASE_VERSION_REGEX.test(i))

      return setR5Versions({ release, all })
    }
  }
})
