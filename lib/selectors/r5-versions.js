// @flow
import {createSelector} from 'reselect'

export default createSelector(
  (state) => state.project.r5Versions,
  (r5Versions) => r5Versions && r5Versions.all
)
