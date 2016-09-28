import deepExtend from 'deep-extend'

let createStore = null
if (process.env.NODE_ENV === 'production') {
  createStore = require('./store.production')
} else {
  createStore = require('./store.development')
}

const initialState = parse(process.env.STORE)
const storedState = parse(window.localStorage ? window.localStorage.getItem('state') : {})

module.exports = createStore(deepExtend(initialState, storedState))

function parse (str) {
  try {
    return JSON.parse(str) || {}
  } catch (e) {
    return {}
  }
}
