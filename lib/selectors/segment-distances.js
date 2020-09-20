import turfLength from '@turf/length'
import {createSelector} from 'reselect'

import selectSegments from './segments'

export default createSelector(selectSegments, (segments = []) =>
  segments.map((s) =>
    s.geometry.type === 'Point' ? 0 : turfLength(s.geometry)
  )
)
