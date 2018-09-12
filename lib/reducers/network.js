// @flow
import {
  DECREMENT_FETCH,
  FETCH_ERROR,
  INCREMENT_FETCH
} from '@conveyal/woonerf/fetch'

type NetworkError = {
  detailMessage: string,
  error: string,
  stack: string,
  url: string
}

type Action =
  {payload: any, type: 'lock ui with error'}
| {payload: void, type: 'clear error'}

type FetchPayload = {
  options: any,
  url: string
}

type NetworkState = {
  allFetches: FetchPayload[],
  error?: NetworkError,
  erroredFetches: FetchPayload[],
  finishedFetches: FetchPayload[],
  outstandingRequests: number
}

export const initialState = {
  allFetches: [],
  error: null,
  erroredFetches: [],
  finishedFetches: [],
  outstandingRequests: 0
}

export const reducers = {
  [DECREMENT_FETCH] (state: NetworkState, action) {
    return {
      ...state,
      finishedFetches: [...state.finishedFetches, action.payload],
      outstandingRequests: state.outstandingRequests - 1
    }
  },
  [INCREMENT_FETCH] (state: NetworkState, action) {
    return {
      ...state,
      allFetches: [...state.allFetches, action.payload],
      outstandingRequests: state.outstandingRequests + 1
    }
  },
  [FETCH_ERROR] (state: NetworkState, action) {
    const {payload} = action
    const erroredFetches = [...state.erroredFetches, action.payload]
    console.error(payload)
    if (action.error) {
      return {
        ...state,
        erroredFetches,
        error: {
          error: `Error in the client`,
          detailMessage: payload.stack
        }
      }
    } else if (payload.value && Array.isArray(payload.value)) {
      const value = payload.value[0]
      if (value.message) {
        return {
          ...state,
          erroredFetches,
          error: {
            error: value.message || 'Error on the server',
            detailMessage: value.exception
              ? exceptionToString(value.exception)
              : ''
          }
        }
      } else {
        return {
          ...state,
          erroredFetches,
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
        ...state,
        erroredFetches,
        error: {
          error: 'Error on the server',
          detailMessage: payload.value ? payload.value.message : payload.message,
          url: payload.url,
          stack: payload.value ? payload.value.stackTrace : payload.stackTrace
        }
      }
    }
  },
  'lock ui with error' (state: NetworkState, action: Action) {
    return {
      ...state,
      error: action.payload
    }
  },
  'clear error' (state: NetworkState, action: Action) {
    return {
      ...state,
      error: null
    }
  }
}

function exceptionToString (exception) {
  return `Caused by: ${exception.message || ''}\n\t${exception.stackTrace
    .map(traceToLine)
    .join('\n\t')}`
}

const traceToLine = trace =>
  `${trace.className}.${trace.methodName}(${trace.fileName}:${trace.lineNumber})`
