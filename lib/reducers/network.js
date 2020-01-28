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
        fetches: state.fetches.filter(f => f.id !== payload.id)
      }
    } else {
      return {
        ...state,
        fetches: state.fetches.filter(f => f.type !== payload.type)
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
    const {payload} = action
    const newState = {
      ...state,
      erroredFetches: [...state.erroredFetches, action.payload],
      fetches: state.fetches.filter(f => f.id !== action.id)
    }

    console.error(payload)
    if (action.error) {
      return {
        ...newState,
        error: {
          error: `Error in the client`,
          detailMessage: payload.stack
        }
      }
    } else if (payload.value && Array.isArray(payload.value)) {
      const value = payload.value[0]
      if (value.message) {
        return {
          ...newState,
          error: {
            error: value.message || 'Error on the server',
            detailMessage: value.exception
              ? exceptionToString(value.exception)
              : ''
          }
        }
      } else {
        return {
          ...newState,
          error: {
            error: value.title,
            detailMessage: value.messages[0],
            url: payload.url,
            stack: payload.value.stackTrace
          }
        }
      }
    } else {
      return {
        ...newState,
        error: {
          error: 'Error on the server',
          detailMessage: payload.value
            ? payload.value.message
            : payload.message,
          url: payload.url,
          stack: payload.value ? payload.value.stackTrace : payload.stackTrace
        }
      }
    }
  },
  'lock ui with error'(state, action) {
    return {
      ...state,
      error: action.payload
    }
  },
  'clear error'(state) {
    return {
      ...state,
      error: null
    }
  }
}

function exceptionToString(exception) {
  return `Caused by: ${exception.message || ''}\n\t${exception.stackTrace
    .map(traceToLine)
    .join('\n\t')}`
}

const traceToLine = trace =>
  `${trace.className}.${trace.methodName}(${trace.fileName}:${trace.lineNumber})`
