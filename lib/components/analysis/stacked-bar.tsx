import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import {memo} from 'react'
import {useSelector} from 'react-redux'

interface StackedBarProps {
  color: string
  percentileCurves: number[][]
  percentileIndex: number
  scale: (n: number) => number
  strokeWidth?: number
  width: number
}

/**
 * An svg stacked bar chart
 */
export default memo<StackedBarProps>(function StackedBarProps({
  color,
  percentileCurves,
  percentileIndex,
  scale,
  strokeWidth = 0.5,
  width
}) {
  const cutoff = useSelector(selectMaxTripDurationMinutes)
  const positions = percentileCurves.map((p) => p[cutoff]).reverse()

  return (
    <>
      {positions.map((v, i) => (
        <rect // first four bars
          width={width}
          x={0}
          y={scale(v)}
          // i is index into unsliced array
          height={
            i === 0 ? scale(0) - scale(v) : scale(positions[i - 1]) - scale(v)
          }
          style={{
            strokeWidth: 0,
            fill: color,
            fillOpacity: (positions.length - i) * 0.03
          }}
          key={`access-${i}`}
        />
      ))}
      <rect // cumulative "halo" for selected percentile
        width={width - strokeWidth}
        x={strokeWidth / 2}
        y={scale(percentileCurves[percentileIndex][cutoff])}
        height={scale(0) - scale(percentileCurves[percentileIndex][cutoff])}
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
