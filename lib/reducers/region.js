const createInitialState = () => ({
  aggregationAreas: []
})

export const reducers = {
  /** Add a newly uploaded aggregation area to the current region */
  'add aggregation area locally'(state, action) {
    return {
      ...state,
      aggregationAreas: [action.payload, ...state.aggregationAreas]
    }
  },
  'set aggregation areas'(state, action) {
    return {
      ...state,
      aggregationAreas: action.payload
    }
  }
}

export const initialState = createInitialState()
