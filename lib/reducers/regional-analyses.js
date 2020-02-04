// Default display cutoff
const DEFAULT_DISPLAY_CUTOFF = 60

// Default display percentile
const DEFAULT_DISPLAY_PERCENTILE = 50

// Only keep 10 grids at a time
const MAX_GRIDS = 10

export const reducers = {
  'set regional analyses'(state, action) {
    return {
      ...state,
      analyses: action.payload
    }
  },
  'set active regional analysis'(state, action) {
    return {
      ...state,
      activeId: action.payload,
      comparisonId: null
    }
  },
  'set comparison regional analysis'(state, action) {
    return {
      ...state,
      comparisonId: action.payload
    }
  },
  'set regional analysis grid'(state, action) {
    return {
      ...state,
      grids: [...state.grids, action.payload].slice(-MAX_GRIDS)
    }
  },
  'set regional analysis display cutoff'(state, action) {
    return {
      ...state,
      displayCutoff: action.payload
    }
  },
  'set regional analysis display percentile'(state, action) {
    return {
      ...state,
      displayPercentile: action.payload
    }
  }
}

export const initialState = {
  analyses: [],
  grids: [],
  displayCutoff: DEFAULT_DISPLAY_CUTOFF,
  displayPercentile: DEFAULT_DISPLAY_PERCENTILE
}
