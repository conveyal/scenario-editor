import {color as parseColor} from 'd3-color'
import get from 'lodash/get'
import {useMemo} from 'react'

import colors from 'lib/constants/colors'
import {useRoutePatterns} from 'lib/gtfs/hooks'
import arraysIntersect from 'lib/utils/arrays-intersect'

import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'

/**
 * Display patterns on the map
 */
export default function PatternLayer({
  activeTrips = null,
  color = colors.NEUTRAL,
  dim = false,
  bundleId,
  modification
}: {
  activeTrips?: string[]
  color?: string
  dim?: boolean
  bundleId: string
  modification: CL.FeedModification
}) {
  const patterns = useRoutePatterns(
    bundleId,
    modification.feed,
    get(modification, 'routes[0]')
  )

  const filteredPatterns = useMemo(() => {
    if (activeTrips != null) {
      return patterns.filter((p) =>
        arraysIntersect(p.associatedTripIds, activeTrips)
      )
    } else {
      return patterns
    }
  }, [activeTrips, patterns])

  const parsedColor = parseColor(color)
  if (dim) parsedColor.opacity = 0.2

  if (filteredPatterns?.length > 0) {
    return (
      <>
        <PatternGeometry color={parsedColor + ''} patterns={filteredPatterns} />
        <DirectionalMarkers
          color={parsedColor + ''}
          patterns={filteredPatterns}
        />
      </>
    )
  } else {
    return null
  }
}
