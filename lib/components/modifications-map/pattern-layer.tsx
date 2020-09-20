import {color as parseColor} from 'd3-color'
import {useState, useEffect} from 'react'

import colors from 'lib/constants/colors'
import {getPatternsForModification} from 'lib/utils/patterns'

import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'

/**
 * Display patterns on the map
 */
export default function PatternLayer({
  activeTrips = null,
  color = colors.NEUTRAL,
  dim = false,
  feed,
  modification
}) {
  const [patterns, setPatterns] = useState(() =>
    getPatternsForModification({
      activeTrips,
      dim,
      feed,
      modification
    })
  )

  useEffect(() => {
    setPatterns(
      getPatternsForModification({
        activeTrips,
        dim,
        feed,
        modification
      })
    )
  }, [activeTrips, dim, feed, modification])

  const parsedColor = parseColor(color)
  if (dim) parsedColor.opacity = 0.2

  if (patterns && patterns.length > 0) {
    return (
      <>
        <PatternGeometry color={parsedColor + ''} patterns={patterns} />
        <DirectionalMarkers color={parsedColor + ''} patterns={patterns} />
      </>
    )
  } else {
    return null
  }
}
