import fpOmit from 'lodash/fp/omit'

import colors from 'lib/constants/colors'

import PatternLayer from '../modifications-map/pattern-layer'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

const filterOutPatterns = fpOmit('patterns')

/**
 * Select routes or trips to remove
 */
export default function RemoveTrips({
  bundle,
  modification,
  update
}: {
  bundle: CL.Bundle
  modification: CL.RemoveTrips
  update: (updates: Partial<CL.RemoveTrips>) => void
}) {
  return (
    <>
      <PatternLayer
        activeTrips={modification.trips}
        bundleId={bundle._id}
        color={colors.REMOVED}
        modification={modification}
      />

      <SelectFeedRouteAndPatterns
        allowMultipleRoutes
        bundle={bundle}
        modification={modification}
        onChange={(m) => update(filterOutPatterns(m))}
      />
    </>
  )
}
