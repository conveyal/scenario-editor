
export const reducers = {
  'set profile request' (state, action) {
    return {
      ...state,
      profileRequest: action.payload
    }
  },
  'clear isochrone results' (state, action) {
    return {
      ...state,
      isochrone: null,
      isochroneLatLng: null
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
  'set isochrone latlng' (state, action) {
    return {
      ...state,
      isochroneLatLng: action.payload
    }
  },
  'set isochrone results' (state, action) {
    const { isochrone, comparisonIsochrone, accessibility, comparisonAccessibility, indicator, grid, isochroneCutoff, spectrogramData, comparisonSpectrogramData } = action.payload
    return {
      ...state,
      isochrone,
      grid,
      accessibility,
      isochroneCutoff,
      spectrogramData,
      comparisonIsochrone,
      comparisonAccessibility,
      comparisonSpectrogramData,
      // clear any previous errors
      scenarioApplicationErrors: null,
      currentIndicator: indicator
    }
  },
  'show scenario application errors' (state, action) {
    return {
      ...state,
      scenarioApplicationErrors: action.payload
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
      isochrone: null,
      comparisonIsochrone: null,
      accessibility: null,
      comparisonAccessibility: null,
      spectrogramData: null,
      comparisonSpectrogramData: null,
      scenarioApplicationErrors: null,
      active: false
    }
  },
  'set active variant' (state, action) {
    return {
      ...state,
      activeVariant: action.payload
    }
  },
  'set comparison in progress' (state, action) {
    return {
      ...state,
      comparisonInProgress: action.payload
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
  }
}

export const initialState = {
  isochroneCutoff: 60,
  isFetchingIsochrone: false,
  active: false,
  comparisonInProgress: false,
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
