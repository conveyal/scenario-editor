
export const reducers = {
  'set profile request' (state, action) {
    return {
      ...state,
      profileRequest: action.payload
    }
  },
  'set destination grid' (state, action) {
    return {
      ...state,
      destinationGrid: action.payload
    }
  },
  'set destination' (state, action) {
    return {
      ...state,
      destination: action.payload
    }
  },
  'clear isochrone results' (state, action) {
    return {
      ...state,
      isochrone: null,
      isochroneLonLat: null
    }
  },
  'set isochrone cutoff' (state, action) {
    return {
      ...state,
      isochroneCutoff: action.payload
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
    return {
      ...state,
      isochroneLonLat: action.payload
    }
  },
  'set scenario application errors' (state, action) {
    return {
      ...state,
      scenarioApplicationErrors: action.payload
    }
  },
  'set scenario application warnings' (state, action) {
    return {
      ...state,
      scenarioApplicationWarnings: action.payload
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
      scenarioApplicationErrors: null,
      scenarioApplicationWarnings: null,
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
  'clear comparison scenario' (state) {
    return {
      ...state,
      comparisonScenarioId: null,
      comparisonBundleId: null,
      comparisonVariant: null,
      comparisonModifications: null
    }
  },
  'set comparison scenario' (state, action) {
    const { id, bundleId, variantIndex } = action.payload
    return {
      ...state,
      comparisonScenarioId: id,
      comparisonBundleId: bundleId,
      comparisonVariant: variantIndex,
      comparisonModifications: null
    }
  },
  'set comparison modifications' (state, action) {
    // re-set all these to ensure the ID and the modifications cannot get out of sync
    const { id, bundleId, variantIndex, modifications } = action.payload
    return {
      ...state,
      comparisonScenarioId: id,
      comparisonBundleId: bundleId,
      comparisonVariant: variantIndex,
      comparisonModifications: modifications
    }
  },
  'set active regional analyses' (state, action) {
    const { id, comparisonId } = action.payload
    return {
      ...state,
      regional: {
        id,
        comparisonId,
        // clear data
        grid: null,
        comparisonGrid: null,
        probabilityGrid: null,
        minimumImprovementProbability: state.regional.minimumImprovementProbability,
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
    const { grid, comparisonGrid, probabilityGrid, differenceGrid, breaks } = action.payload
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
  'set minimum improvement probability' (state, action) {
    return {
      ...state,
      regional: {
        ...state.regional,
        minimumImprovementProbability: action.payload
      }
    }
  },
  'set current indicator' (state, action) {
    return {
      ...state,
      currentIndicator: action.payload
    }
  },
  'select bookmark' (state, action) {
    const { profileRequest, isochroneCutoff, destinationGrid } = action.payload
    return {
      ...state,
      profileRequest,
      isochroneCutoff,
      isochroneLonLat: {
        lon: profileRequest.fromLon,
        lat: profileRequest.fromLat
      },
      currentIndicator: destinationGrid
    }
  }
}

export const initialState = {
  isochroneCutoff: 60,
  isFetchingIsochrone: false,
  active: false,
  scenarioApplicationErrors: null,
  regional: {
    id: null,
    comparisonId: null,
    percentile: 50,
    grid: null,
    comparisonGrid: null,
    probabilityGrid: null,
    minimumImprovementProbability: 0.95,
    breaks: []
  },
  profileRequest: {
    date: (new Date()).toISOString().split('T')[0],
    fromTime: 25200,
    toTime: 32400,
    accessModes: 'WALK',
    directModes: 'WALK',
    egressModes: 'WALK',
    transitModes: 'TRANSIT',
    walkSpeed: 1.3888888888888888,
    bikeSpeed: 4.166666666666667,
    carSpeed: 20,
    streetTime: 90,
    maxWalkTime: 20,
    maxBikeTime: 20,
    maxCarTime: 45,
    minBikeTime: 10,
    minCarTime: 10,
    suboptimalMinutes: 5,
    reachabilityThreshold: 0,
    bikeSafe: 1,
    bikeSlope: 1,
    bikeTime: 1,
    bikeTrafficStress: 4,
    monteCarloDraws: 200,
    maxRides: 4
  }
}
