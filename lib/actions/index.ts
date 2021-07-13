import {stringify} from 'querystring'
import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import setURLSearchParameter from 'lib/utils/set-search-parameter'

import fetch from './fetch'

// For storing the query string
export const setQueryString = createAction('set query string')

// Update a search parameters
export const setSearchParameter = (
  params: string | Record<string, string>,
  value?: string
) => {
  if (typeof params === 'string') {
    const opts = {[`${params}`]: value}
    setURLSearchParameter(opts)
    return {
      type: 'set search parameter',
      payload: opts
    }
  } else {
    setURLSearchParameter(params)
    return {
      type: 'set search parameter',
      payload: params
    }
  }
}

export const clearError = createAction('clear error')

// feed
/** Update the data pulled in from the GTFS feed */
export const setFeeds = createAction('set feeds')

// login / logout
export const login = createAction('log in')
export const setUser = createAction('set user')

export default {}
