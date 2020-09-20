import fpOmit from 'lodash/fp/omit'

import colors from 'lib/constants/colors'

import PatternLayer from '../modifications-map/pattern-layer'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

const filterOutPatterns = fpOmit('patterns')

/**
 * Select routes or trips to remove
 */
export default function RemoveTrips({
  modification,
  selectedFeed,
  updateAndRetrieveFeedData
}) {
  return (
    <>
      <PatternLayer
        color={colors.REMOVED}
        feed={selectedFeed}
        modification={modification}
      />

      <SelectFeedRouteAndPatterns
        allowMultipleRoutes
        onChange={(m) => updateAndRetrieveFeedData(filterOutPatterns(m))}
        routes={modification.routes}
        trips={modification.trips}
      />
    </>
  )
}
