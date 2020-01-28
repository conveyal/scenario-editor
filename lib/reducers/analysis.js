import lonlat from '@conveyal/lonlat'

import {PROFILE_REQUEST_DEFAULTS} from '../constants'

export const reducers = {
  'set profile request'(state, action) {
    return {
      ...state,
      profileRequest: action.payload
    }
  },
  'update profile request'(state, action) {
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        ...action.payload
      }
    }
  },
  'set displayed profile request'(state, action) {
    return {
      ...state,
      displayedProfileRequest: {...action.payload}
    }
  },
  'r5Version/SET_CURRENT'(state, action) {
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        workerVersion: action.payload
      }
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
  'set isochrone lonlat'(state, action) {
    const ll = lonlat(action.payload)
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        fromLat: ll.lat,
        fromLon: ll.lon
      }
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
  'set active variant'(state, action) {
    return {
      ...state,
      activeVariant: action.payload
    }
  },
  'clear comparison project'(state) {
    return {
      ...state,
      comparisonProjectId: null,
      comparisonVariant: null
    }
  },
  'set comparison project'(state, action) {
    const {_id, variantIndex} = action.payload
    return {
      ...state,
      comparisonProjectId: _id,
      comparisonVariant: variantIndex
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
  'select bookmark'(state, action) {
    const {_id, profileRequest, isochroneCutoff} = action.payload
    return {
      ...state,
      profileRequest,
      isochroneCutoff,
      selectedBookmark: _id
    }
  }
}

export const initialState = {
  active: false,
  isochroneFetchStatus: false,
  scenarioApplicationErrors: null,
  regional: {
    _id: null,
    comparisonId: null,
    percentile: 50,
    grid: null,
    comparisonGrid: null,
    breaks: []
  },
  profileRequest: {...PROFILE_REQUEST_DEFAULTS},
  selectedBookmark: null
}
