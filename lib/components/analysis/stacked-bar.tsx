import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import {memo} from 'react'
import {useSelector} from 'react-redux'

interface StackedBarProps {
  boxPlotItems: number[]
  color: string
  percentileCurves: number[][]
  positionIndex: number
  scale: (n: number) => number
  strokeWidth?: number
  width: number
}

/**
 * An svg stacked bar chart
 */
export default memo<StackedBarProps>(function StackedBarProps({
  boxPlotItems,
  color,
  percentileCurves,
  positionIndex,
  scale,
  strokeWidth = 0.5,
  width
}) {
  const cutoff = useSelector(selectMaxTripDurationMinutes)
  const positions = boxPlotItems.map((i) => percentileCurves[i][cutoff - 1])
  const MAX_OPACITY = 0.6

  return (
    <>
      {positions.slice(1).map((v, i) => (
        <rect // first four bars
          width={width}
          x={0}
          y={scale(v)}
          height={scale(positions[i]) - scale(v)} // i is index into unsliced array
          opacity={MAX_OPACITY - (i + 1) * 0.1}
          style={{strokeWidth: 0, fill: color}}
          key={`access-${i}`}
        />
      ))}
      <rect // last bar
        width={width}
        x={0}
        y={scale(positions[0])}
        height={scale(0) - scale(positions[0])}
        style={{opacity: MAX_OPACITY, fill: color}}
      />
      <rect // cumulative "halo" for selected percentile
        width={width}
        x={0}
        y={scale(positions[positionIndex])}
        height={scale(0) - scale(positions[positionIndex])}
        style={{
          stroke: color,
          strokeWidth: strokeWidth,
          strokeOpacity: 0.75,
          fillOpacity: 0
        }}
      />
    </>
  )
})
