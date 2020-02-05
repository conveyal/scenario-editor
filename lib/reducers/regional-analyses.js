// Only keep 10 grids at a time
const MAX_GRIDS = 10

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
      grids: [...state.grids, action.payload].slice(-MAX_GRIDS)
    }
  }
}

export const initialState = {
  analyses: [],
  grids: []
}
