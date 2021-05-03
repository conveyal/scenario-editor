import {createSelector} from 'reselect'

import {toLatLngBounds} from 'lib/utils/bounds'

import selectCurrentRegion from './current-region'

export default createSelector(selectCurrentRegion, (r: CL.Region) =>
  r ? toLatLngBounds(r.bounds) : null
)
