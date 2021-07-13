import get from 'lodash/get'
import {useMemo} from 'react'

import useCurrentProject from 'lib/hooks/use-current-project'
import {useBundleStops, useRoutePatterns} from 'lib/gtfs/hooks'

import scopeAddTripPatternStops from '../scope-add-trip-pattern-stops'

import useProjectModifications from './use-project-modifications'

export default function useAvailablePhaseStops(
  phaseFromTimetable: string
): GTFS.FeedScopedStop[] {
  const [modificationId, timetableId] = phaseFromTimetable?.split(':') ?? []
  const project = useCurrentProject()
  const modifications = useProjectModifications()
  const bundleId = project ? project.bundleId : null
  const bundleStops = useBundleStops(bundleId)
  const modification = modifications.find((m) => m._id === modificationId)
  const routePatterns = useRoutePatterns(
    bundleId,
    get(modification, 'feed'),
    get(modification, 'routes[0]')
  )

  return useMemo(() => {
    if (modification.type === 'convert-to-frequency') {
      const entry = modification.entries.find((t) => t._id === timetableId)
      if (!entry) return []
      const pattern = routePatterns.find((p) =>
        p.associatedTripIds.includes(entry.sourceTrip)
      )
      const feedStops = bundleStops.find(
        (bs) => bs.feedId === modification.feed
      )?.stops
      const stops = pattern.orderedStopIds
        .map((id) => feedStops.find((s) => s.id === id))
        .filter((s) => !!s)
      return stops.map((stop) => ({
        feedId: modification.feed,
        scopedId: `${modification.feed}:${stop.id}`,
        ...stop
      }))
    } else if (modification.type === 'add-trip-pattern') {
      return scopeAddTripPatternStops(modification, bundleStops)
    }
    return []
  }, [bundleStops, modification, routePatterns, timetableId])
}
