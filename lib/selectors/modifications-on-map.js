// @flow
import {createSelector} from 'reselect'

import {ADD_TRIP_PATTERN} from '../constants'

import selectActiveModificationId from './active-modification-id'
import selectModifications from './modifications'

export default createSelector(
  [selectActiveModificationId, selectModifications],
  (activeModificationId, modifications = []) =>
    modifications.filter(m =>
      (m._id === activeModificationId || m.showOnMap) &&
      (m.feed || m.type === ADD_TRIP_PATTERN))
)
