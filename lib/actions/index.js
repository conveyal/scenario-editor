import {stringify} from 'querystring'
import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import setURLSearchParameter from 'lib/utils/set-search-parameter'

import fetch from './fetch'

// For storing the query string
export const setQueryString = createAction('set query string')

// Update a search parameters
export const setSearchParameter = createAction(
  'set search parameter',
  (params, value) => {
    if (typeof params === 'string') {
      const opts = {[`${params}`]: value}
      setURLSearchParameter(opts)
      return opts
    } else {
      setURLSearchParameter(params)
      return params
    }
  }
)

export const clearError = createAction('clear error')

// bundle
export const addBundle = createAction('add bundle')
const deleteBundleLocally = createAction('delete bundle')
export const deleteBundle = (_id) =>
  fetch({
    url: `${API.Bundle}/${_id}`,
    options: {
      method: 'delete'
    },
    next: () => deleteBundleLocally(_id)
  })
export const saveBundle = (bundle) =>
  fetch({
    url: `${API.Bundle}/${bundle._id}`,
    options: {
      method: 'put',
      body: bundle
    },
    next: (response) => setBundle(response.value)
  })
export const setBundle = createAction('set bundle')
export const setBundles = createAction('set bundles')
export const loadBundle = (_id) =>
  fetch({
    url: `${API.Bundle}/${_id}`,
    next: (response) => setBundle(response.value)
  })
export const loadBundles = (query) =>
  fetch({
    url: `${API.Bundle}?${stringify(query)}`,
    next: (response) => setBundles(response.value)
  })

// feed
/** Update the data pulled in from the GTFS feed */
export const setFeeds = createAction('set feeds')

// login / logout
export const login = createAction('log in')
export const setUser = createAction('set user')

export default {}
