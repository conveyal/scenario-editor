export const reducers = {
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
  }
}

export const initialState = {
  analyses: [],
  grids: []
}
