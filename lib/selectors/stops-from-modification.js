import {createSelector} from 'reselect'

import getStops from '../utils/get-stops'

import selectSegments from './segments'

export default createSelector(selectSegments, segments => getStops(segments))
