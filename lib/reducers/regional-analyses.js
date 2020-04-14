export const reducers = {
  'delete regional analysis'(state, action) {
    const id = action.payload
    return {
      ...state,
      analyses: state.analyses.filter(r => r._id !== id)
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
  'set active regional jobs'(state, action) {
    return {
      ...state,
      activeJobs: action.payload
    }
  }
}

export const initialState = {
  activeJobs: [],
  analyses: [],
  grids: []
}
