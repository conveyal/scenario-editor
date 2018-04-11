// @flow
import {createSelector} from 'reselect'

export default createSelector(
  state => state.project.bundles,
  (bundles = []) => bundles.filter(b => b.status === 'DONE')
)
