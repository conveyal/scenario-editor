import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'
import selectComparisonIsochrones from 'lib/selectors/comparison-isochrone'
import selectIsochrones from 'lib/selectors/isochrone'
import nearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import GeoJSON from './geojson'
import {PathOptions} from 'leaflet'

const isochroneStyle = (fillColor: string): PathOptions => ({
  color: fillColor,
  fillColor,
  fillOpacity: 0.1,
  stroke: false,
  weight: 1
})

const mainIsochroneStyle = isochroneStyle(colors.PROJECT_ISOCHRONE_COLOR)
const compIsochroneStyle = isochroneStyle(colors.COMPARISON_ISOCHRONE_COLOR)
const staleIsochroneStyle = isochroneStyle(colors.STALE_PERCENTILE_COLOR)
const selectedIndexStyle = {...mainIsochroneStyle, stroke: true}
const selectedIndexComparisonStyle = {...compIsochroneStyle, stroke: true}

export default function Isochrones(p) {
  const isochrones = useSelector(selectIsochrones)
  const comparisonIsochrones = useSelector(selectComparisonIsochrones)
  const percentileIndex = nearestPercentileIndex(
    useSelector(selectTravelTimePercentile)
  )

  return (
    <>
      {(comparisonIsochrones?.features ?? []).map((feature, i) => (
        <GeoJSON
          key={`comparison-isochrones-${i}`}
          data={feature}
          style={
            p.isCurrent
              ? i === percentileIndex
                ? selectedIndexComparisonStyle
                : compIsochroneStyle
              : staleIsochroneStyle
          }
        />
      ))}

      {(isochrones?.features ?? []).map((feature, i) => (
        <GeoJSON
          key={`isochrones-${i}`}
          data={feature}
          style={
            p.isCurrent
              ? i === percentileIndex
                ? selectedIndexStyle
                : mainIsochroneStyle
              : staleIsochroneStyle
          }
        />
      ))}
    </>
  )
}
