import {useMemo} from 'react'

import {useRoutePatterns} from 'lib/gtfs/hooks'
import intersects from 'lib/utils/arrays-intersect'

export default function useModificationPatterns(
  bundle: CL.Bundle,
  modification: CL.TripsModification
) {
  const patterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )
  return useMemo(() => {
    if (modification.trips?.length > 0) {
      return patterns.filter((p) =>
        intersects(p.associatedTripIds, modification.trips)
      )
    } else {
      return patterns
    }
  }, [patterns, modification.trips])
}
