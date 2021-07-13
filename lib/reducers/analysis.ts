import omit from 'lodash/omit'

import {PROFILE_REQUEST_DEFAULTS} from '../constants'

const createInitialState = () => ({
  active: false,
  isochroneFetchStatus: false,
  maxTripDurationMinutes: 60,
  scenarioApplicationErrors: null,
  regional: {
    _id: null,
    comparisonId: null,
    percentile: 50,
    grid: null,
    comparisonGrid: null,
    breaks: []
  },
  requestsSettings: [{...PROFILE_REQUEST_DEFAULTS}],
  copyRequestSettings: true,
  resultsSettings: [],
  travelTimePercentile: 50
})

export const initialState = createInitialState()

export const reducers = {
  'set max trip duration minutes'(state, action) {
    return {
      ...state,
      maxTripDurationMinutes: action.payload
    }
  },
  'set copy request settings'(state, action) {
    const rs = state.requestsSettings
    const copyRequestSettings = action.payload
    return {
      ...state,
      copyRequestSettings,
      requestsSettings: [
        rs[0],
        copyRequestSettings
          ? {
              ...rs[1],
              ...omit(rs[0], ['projectId', 'scenarioId'])
            }
          : rs[1] // re-copy over the settings on switch
      ]
    }
  },
  'set travel time percentile'(state, action) {
    return {
      ...state,
      travelTimePercentile: action.payload
    }
  },
  'set requests settings'(state, action) {
    return {
      ...state,
      requestsSettings: action.payload
    }
  },
  'set results settings'(state, action) {
    return {
      ...state,
      resultsSettings: [...action.payload]
    }
  },
  'clear comparison settings'(state) {
    return {
      ...state,
      requestsSettings: [state.requestsSettings[0]]
    }
  },
  'copy primary settings'(state) {
    return {
      ...state,
      requestsSettings: [
        state.requestsSettings[0],
        {...state.requestsSettings[0]}
      ]
    }
  },
  'update requests settings'(state, action) {
    const rs = [...state.requestsSettings]
    const {index, params} = action.payload
    rs[index] = {
      ...rs[index],
      ...params
    }
    if (state.copyRequestSettings && index === 0) {
      rs[1] = {
        ...rs[1],
        ...omit(rs[0], ['projectId', 'scenarioId'])
      }
    }
    return {
      ...state,
      requestsSettings: rs
    }
  },
  'set destination'(state, action) {
    return {
      ...state,
      destination: action.payload
    }
  },
  'set isochrone fetch status'(state, action) {
    return {
      ...state,
      isochroneFetchStatus: action.payload
    }
  },
  'set scenario application errors'(state, action) {
    return {
      ...state,
      scenarioApplicationErrors: action.payload
    }
  },
  'set scenario application warnings'(state, action) {
    return {
      ...state,
      scenarioApplicationWarnings: action.payload
    }
  },
  'set travel time surface'(state, action) {
    return {
      ...state,
      travelTimeSurface: action.payload
    }
  },
  'set comparison travel time surface'(state, action) {
    return {
      ...state,
      comparisonTravelTimeSurface: action.payload
    }
  },
  'set active regional analyses'(state, action) {
    const {_id, comparisonId} = action.payload
    return {
      ...state,
      regional: {
        ...state.regional,
        _id,
        comparisonId,
        // clear data
        grid: null,
        comparisonGrid: null,
        breaks: []
      }
    }
  },
  'set regional analysis bounds'(state, action) {
    return {
      ...state,
      regional: {
        bounds: action.payload
      }
    }
  },
  'set regional analysis grids'(state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        ...action.payload
      }
    }
  },
  /** Set the origin used for displaying the sampling distribution in a regional analysis */
  'set regional analysis origin'(state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        origin: action.payload
      }
    }
  },
  'set active aggregation area'(state, action) {
    return {
      ...state,
      aggregationArea: action.payload
    }
  },
  /** Set the sampling distribution of accessibility at the above point */
  'set regional analysis sampling distribution'(state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        samplingDistribution: action.payload
      }
    }
  },
  /** Set the sampling distribution of accessibility at the above point for the comparison regional analysis */
  'set comparison regional analysis sampling distribution'(state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        comparisonSamplingDistribution: action.payload
      }
    }
  },
  'clear current region'() {
    return createInitialState()
  }
}
