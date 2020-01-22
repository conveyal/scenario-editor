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
  }
}

export const initialState = {
  analyses: [],
  grids: []
}
