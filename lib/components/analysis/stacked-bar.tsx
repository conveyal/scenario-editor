import {memo} from 'react'

interface StackedBarProps {
  color: string
  positions: number[]
  positionIndex: number
  scale: (number) => number
  strokeWidth?: number
  width: number
}

/**
 * An svg stacked bar chart
 */
export default memo<StackedBarProps>(function StackedBarProps({
  color,
  positions,
  positionIndex,
  scale,
  strokeWidth = 0.5,
  width
}) {
  const MAX_OPACITY = 0.6

  const barLeft = 0.1 * width
  const barWidth = 0.8 * width

  return (
    <g>
      {positions.slice(1).map((v, i) => (
        <rect // first four bars
          width={barWidth}
          x={barLeft}
          y={scale(v)}
          height={scale(positions[i]) - scale(v)} // i is index into unsliced array
          opacity={MAX_OPACITY - (i + 1) * 0.1}
          style={{strokeWidth: 0, fill: color}}
          key={`access-${i}`}
        />
      ))}
      <rect // last bar
        width={barWidth}
        x={barLeft}
        y={scale(positions[0])}
        height={scale(0) - scale(positions[0])}
        style={{opacity: MAX_OPACITY, fill: color}}
      />
      <rect // cumulative "halo" for selected percentile
        width={barWidth}
        x={barLeft}
        y={scale(positions[positionIndex])}
        height={scale(0) - scale(positions[positionIndex])}
        style={{
          stroke: color,
          strokeWidth: strokeWidth,
          strokeOpacity: 0.9,
          fillOpacity: 0
        }}
      />
    </g>
  )
})
