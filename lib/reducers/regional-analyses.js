const createInitialState = () => ({
  activeJobs: [],
  analyses: [],
  grids: []
})

export const initialState = createInitialState()

export const reducers = {
  'delete regional analysis'(state, action) {
    const id = action.payload
    return {
      ...state,
      analyses: state.analyses.filter((r) => r._id !== id)
    }
  },
  'set regional analyses'(state, action) {
    return {
      ...state,
      analyses: action.payload
    }
  },
  'set regional analysis grid'(state, action) {
    return {
      ...state,
      grids: [...state.grids, action.payload]
    }
  },
  'set regional analysis'(state, action) {
    const analyses = state.analyses.filter((r) => r._id !== action.payload._id)
    return {
      ...state,
      analyses: [...analyses, action.payload]
    }
  },
  'clear current region'() {
    return createInitialState()
  },
  'set active regional jobs'(state, action) {
    return {
      ...state,
      activeJobs: action.payload
    }
  }
}
