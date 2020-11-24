import {applyMiddleware, combineReducers, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import reducers from './reducers'
import multi from './utils/multi'

const isServer = typeof window === 'undefined'
const middlewares = [multi, thunkMiddleware]

/**
 * Configure the Redux store with middleware, reducers, and a derived initial
 * state. Only add the logging middleware on the client side.
 */
function initializeStore(initialState) {
  if (!isServer) {
    middlewares.push(createLogger({collapsed: true, duration: true}))
  }

  return createStore(
    combineReducers(reducers),
    initialState,
    applyMiddleware(...middlewares)
  )
}

let reduxStore
export default function getOrInitializeStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!reduxStore) {
    reduxStore = initializeStore(initialState)
  }

  // Attach the store to the window object.
  window.AppStore = reduxStore

  return reduxStore
}
