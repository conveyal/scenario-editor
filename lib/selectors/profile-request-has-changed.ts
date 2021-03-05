import {dequal} from 'dequal/lite'
import get from 'lodash/get'
import omit from 'lodash/omit'
import {createSelector} from 'reselect'

import selectProfileRequestLonLat from './profile-request-lonlat'

import {activeOpportunityDatasetId} from 'lib/modules/opportunity-datasets/selectors'

const omitKeys = [
  'maxTripDurationMinutes',
  'opportunityDatasetId',
  'travelTimePercentile'
]
const hasChanged = (a, b) => !dequal(omit(a, omitKeys), omit(b, omitKeys))

const accessibilityOutOfSync = (results, currentId) =>
  results &&
  get(results, 'decayFunction.type', 'step') !== 'step' &&
  get(results, 'destinationPointSetIds[0]') !== currentId

/**
 * Compare the results vs the current settings.
 */
export default createSelector(
  selectProfileRequestLonLat,
  (state) => get(state, 'analysis.copyRequestSettings'),
  (state) => get(state, 'analysis.requestsSettings', []),
  (state) => get(state, 'analysis.resultsSettings', []),
  activeOpportunityDatasetId,
  (
    lonlat,
    copyRequestSettings,
    requestsSettings,
    resultsSettings,
    opportunitDatasetId
  ) => {
    const [req1, req2] = requestsSettings
    const [res1, res2] = resultsSettings
    const position = {fromLat: lonlat.lat, fromLon: lonlat.lon}

    const primaryHasChanged = hasChanged({...req1, ...position}, res1)
    const comparisonHasChanged = hasChanged(
      {
        ...(copyRequestSettings ? req1 : req2 ?? {}), // if copying
        ...position,
        // even when copying comparison may have different project/scenario
        projectId: req2?.projectId,
        variantIndex: req2?.variantIndex
      },
      res2
    )

    // Check primary request settings
    if (primaryHasChanged) return true
    if ((res2?.projectId || req2?.projectId) && comparisonHasChanged)
      return true

    // If the accessibility was calculated server side, check for opportunity changes
    if (
      accessibilityOutOfSync(res1, opportunitDatasetId) ||
      accessibilityOutOfSync(res2, opportunitDatasetId)
    ) {
      return true
    }

    return false
  }
)
