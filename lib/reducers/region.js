import sortBy from 'lodash/sortBy'

const sortByCreatedAt = (a) => sortBy(a, (i) => -i.createdAt)

const createInitialState = () => ({
  aggregationAreas: [],
  bookmarks: [],
  bundles: [],
  regions: []
})

export const reducers = {
  'delete region'(state, action) {
    return {
      ...createInitialState(),
      regions: state.regions.filter((p) => p._id !== action.payload)
    }
  },
  'set region'(state, action) {
    const region = action.payload
    return {
      ...state,
      regions: sortByCreatedAt([
        ...state.regions.filter((r) => r._id !== region._id),
        region
      ])
    }
  },
  /** Add a bookmark to the region locally */
  'create bookmark'(state, action) {
    return {
      ...state,
      bookmarks: [action.payload, ...state.bookmarks]
    }
  },
  'set bookmarks'(state, action) {
    return {
      ...state,
      bookmarks: action.payload
    }
  },
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
  },

  // Bundles
  'add bundle'(state, action) {
    return {
      ...state,
      bundles: [action.payload, ...state.bundles]
    }
  },
  'delete bundle'(state, action) {
    return {
      ...state,
      bundles: state.bundles.filter((b) => b._id !== action.payload)
    }
  },
  'set bundle'(state, action) {
    const bundle = action.payload
    const index = state.bundles.findIndex((b) => b._id === bundle._id)
    if (index === -1) {
      return {
        ...state,
        bundles: [...state.bundles, bundle]
      }
    } else {
      return {
        ...state,
        bundles: state.bundles.map((b) => (b._id === bundle._id ? bundle : b))
      }
    }
  },
  'set bundles'(state, action) {
    return {
      ...state,
      bundles: action.payload
    }
  },
  'clear current region'(state) {
    return {
      ...createInitialState(),
      regions: state.regions
    }
  }
}

export const initialState = createInitialState()
