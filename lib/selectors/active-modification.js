// @flow
import {createSelector} from 'reselect'

import selectActiveModificationId from './active-modification-id'
import selectModifications from './modifications'

export default createSelector(
  [selectModifications, selectActiveModificationId],
  (modifications = [], modificationId) =>
    modifications.find((m) => m._id === modificationId)
)
