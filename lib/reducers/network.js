import {DECREMENT_FETCH, FETCH_ERROR, INCREMENT_FETCH} from 'lib/actions/fetch'

export const initialState = {
  error: null,
  erroredFetches: [],
  fetches: []
}

export const reducers = {
  [DECREMENT_FETCH](state, {payload}) {
    if (payload.id) {
      return {
        ...state,
        fetches: state.fetches.filter((f) => f.id !== payload.id)
      }
    } else {
      return {
        ...state,
        fetches: state.fetches.filter((f) => f.type !== payload.type)
      }
    }
  },
  [INCREMENT_FETCH](state, action) {
    return {
      ...state,
      fetches: [...state.fetches, action.payload]
    }
  },
  [FETCH_ERROR](state, action) {
    const newState = {
      ...state,
      erroredFetches: [...state.erroredFetches, action.payload],
      fetches: state.fetches.filter((f) => f.id !== action.id)
    }

    return {
      ...newState,
      error: action.error || action.payload
    }
  },
  'clear error'(state) {
    return {
      ...state,
      error: null
    }
  }
}
