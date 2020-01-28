import {createSelector} from 'reselect'

export default createSelector(
  state => state.network,
  (network = {}) => {
    return (network.fetches || []).length > 0
  }
)
