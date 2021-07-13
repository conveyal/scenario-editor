import {useRoute} from 'lib/gtfs/hooks'

/**
 * Helper hook to get the GTFS route for a modification.
 */
export default function useModificationRoute(
  bundle: CL.Bundle,
  modification: CL.FeedModification
) {
  return useRoute(
    bundle._id,
    modification.feed,
    Array.isArray(modification.routes) ? modification.routes[0] : null
  )
}
