import {color as d3Color} from 'd3-color'
import {memo} from 'react'
import {useSelector} from 'react-redux'

import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'

interface StackedBarProps {
  color: string
  minOpacity: number
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
  minOpacity,
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
      {positions.map((v, i) => {
        const c = d3Color(color).rgb()
        const o = (positions.length - i) * minOpacity
        c.r = 255 + (c.r - 255) * o
        c.g = 255 + (c.g - 255) * o
        c.b = 255 + (c.b - 255) * o
        return (
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
              fill: c.formatHex()
            }}
            key={`access-${i}`}
          />
        )
      })}
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
