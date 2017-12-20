import lonlat from '@conveyal/lonlat'

import {PROFILE_REQUEST_DEFAULTS} from '../constants'

export const reducers = {
  'set profile request' (state, action) {
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        ...action.payload
      }
    }
  },
  'set displayed profile request' (state, action) {
    return {
      ...state,
      displayedProfileRequest: {...action.payload}
    }
  },
  'opportunityDatasets/SET_ACTIVE' (state, action) {
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        opportunityDatasetKey: action.payload
      }
    }
  },
  'r5Version/SET_CURRENT' (state, action) {
    return {
      ...state,
      profileRequest: {
        ...state.profileRequest,
        workerVersion: action.payload
      }
    }
  },
  'set destination' (state, action) {
    return {
      ...state,
      destination: action.payload
    }
  },
  'set isochrone fetch status' (state, action) {
    return {
      ...state,
      isFetchingIsochrone: action.payload
    }
  },
  'set isochrone fetch status message' (state, action) {
    return {
      ...state,
      isochroneFetchStatusMessage: action.payload
    }
  },
  'set isochrone lonlat' (state, action) {
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
  'set project application errors' (state, action) {
    return {
      ...state,
      projectApplicationErrors: action.payload
    }
  },
  'set project application warnings' (state, action) {
    return {
      ...state,
      projectApplicationWarnings: action.payload
    }
  },
  'set travel time surface' (state, action) {
    return {
      ...state,
      travelTimeSurface: action.payload
    }
  },
  'set comparison travel time surface' (state, action) {
    return {
      ...state,
      comparisonTravelTimeSurface: action.payload
    }
  },
  'enter analysis mode' (state, action) {
    return {
      ...state,
      active: true
    }
  },
  'exit analysis mode' (state, action) {
    return {
      ...state,
      projectApplicationErrors: null,
      projectApplicationWarnings: null,
      travelTimeSurface: null,
      comparisonTravelTimeSurface: null,
      active: false
    }
  },
  'set active variant' (state, action) {
    return {
      ...state,
      activeVariant: action.payload
    }
  },
  'clear comparison project' (state) {
    return {
      ...state,
      comparisonProjectId: null,
      comparisonBundleId: null,
      comparisonVariant: null,
      comparisonModifications: null
    }
  },
  'set comparison project' (state, action) {
    const {_id, bundleId, variantIndex} = action.payload
    return {
      ...state,
      comparisonProjectId: _id,
      comparisonBundleId: bundleId,
      comparisonVariant: variantIndex,
      comparisonModifications: null
    }
  },
  'set comparison modifications' (state, action) {
    // re-set all these to ensure the ID and the modifications cannot get out of sync
    const {_id, bundleId, variantIndex, modifications} = action.payload
    return {
      ...state,
      comparisonProjectId: _id,
      comparisonBundleId: bundleId,
      comparisonVariant: variantIndex,
      comparisonModifications: modifications
    }
  },
  'set active regional analyses' (state, action) {
    const {_id, comparisonId} = action.payload
    return {
      ...state,
      regional: {
        _id,
        comparisonId,
        // clear data
        grid: null,
        comparisonGrid: null,
        probabilityGrid: null,
        minimumImprovementProbability: state.regional
          .minimumImprovementProbability,
        breaks: []
      }
    }
  },
  'set regional analysis bounds' (state, action) {
    return {
      ...state,
      regional: {
        bounds: action.payload
      }
    }
  },
  'set regional analysis grids' (state, action) {
    const {
      grid,
      comparisonGrid,
      probabilityGrid,
      differenceGrid,
      breaks
    } = action.payload
    return {
      ...state,
      regional: {
        ...state.regional,
        grid,
        comparisonGrid,
        probabilityGrid,
        differenceGrid,
        breaks
      }
    }
  },
  'set aggregation area id' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        aggregationAreaId: action.payload
      }
    }
  },
  /** Set the origin used for displaying the sampling distribution in a regional analysis */
  'set regional analysis origin' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        origin: action.payload
      }
    }
  },
  'set aggregation area' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        aggregationArea: action.payload
      }
    }
  },
  /** Set the sampling distribution of accessibility at the above point */
  'set regional analysis sampling distribution' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        samplingDistribution: action.payload
      }
    }
  },
  'set aggregation weights id' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        aggregationWeightsId: action.payload
      }
    }
  },
  /** Set the sampling distribution of accessibility at the above point for the comparison regional analysis */
  'set comparison regional analysis sampling distribution' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        comparisonSamplingDistribution: action.payload
      }
    }
  },
  'set aggregation weights' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        aggregationWeights: action.payload
      }
    }
  },
  'set aggregation area uploading' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        aggregationAreaUploading: action.payload
      }
    }
  },
  // TODO rename to 'set minimum probability of change'
  'set minimum improvement probability' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        minimumImprovementProbability: action.payload
      }
    }
  },
  'select bookmark' (state, action) {
    const {
      _id,
      profileRequest,
      isochroneCutoff
    } = action.payload
    return {
      ...state,
      profileRequest,
      isochroneCutoff,
      selectedBookmark: _id
    }
  }
}

export const initialState = {
  isFetchingIsochrone: false,
  active: false,
  projectApplicationErrors: null,
  regional: {
    _id: null,
    comparisonId: null,
    percentile: 50,
    grid: null,
    comparisonGrid: null,
    probabilityGrid: null,
    minimumImprovementProbability: 0.95,
    breaks: []
  },
  profileRequest: {...PROFILE_REQUEST_DEFAULTS},
  selectedBookmark: null
}
