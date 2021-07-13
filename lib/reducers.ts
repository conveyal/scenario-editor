import unionBy from 'lodash/unionBy'
import sortBy from 'lodash/sortBy'
import {handleActions} from 'redux-actions'

import opportunityDatasets from './modules/opportunity-datasets/reducer'
import r5Version from './modules/r5-version/reducer'
import * as analysis from './reducers/analysis'
import * as network from './reducers/network'
import * as region from './reducers/region'
import * as regionalAnalyses from './reducers/regional-analyses'

/**
 * Simple reducer for storing the query string. This OVERWRITES the object so
 * that a re-render is not called. Going completely against Redux workflows so
 * that we can store the query string in the state.
 */
function queryString(state = {}, action) {
  if (action.type === 'set query string') {
    const currentKeys = Object.keys(state)
    const newKeys = Object.keys(action.payload)
    newKeys.forEach((k) => {
      state[k] = action.payload[k]
    })
    currentKeys
      .filter((k) => !newKeys.includes(k))
      .forEach((k) => {
        delete state[k]
      })
  } else if (action.type === 'set search parameter') {
    return {
      ...state,
      ...action.payload
    }
  }
  return state
}

function user(state = {}, action) {
  if (action.type === 'set user') {
    return action.payload
  }
  return state
}

function resources(state = [], action) {
  if (action.type === 'delete resource') {
    return state.filter((r) => r._id !== action.payload._id)
  } else if (action.type === 'set resources') {
    return action.payload
  } else if (action.type === 'set resource') {
    return sortBy(unionBy([action.paylod], state, '_id'), '_id')
  }

  return state
}

export default {
  analysis: handleActions(analysis.reducers, analysis.initialState),
  network: handleActions(network.reducers, network.initialState),
  opportunityDatasets,
  queryString,
  resources,
  region: handleActions(region.reducers, region.initialState),
  regionalAnalyses: handleActions(
    regionalAnalyses.reducers,
    regionalAnalyses.initialState
  ),
  r5Version,
  user
}
