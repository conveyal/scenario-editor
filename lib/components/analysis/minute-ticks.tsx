import {memo} from 'react'

// The x axis labels for the plot
const TIME_LABELS = [0, 15, 30, 45, 60, 75, 90, 105, 120]

interface MinuteTicksProps {
  minutes?: number[]
  scale: (s: number) => number
}

/**
 * Render the minute axis ticks - shared by stacked percentile curves plot and
 * travel time distribution plot.
 */
export default memo<MinuteTicksProps>(function MinuteTicks({
  minutes = TIME_LABELS,
  scale
}) {
  return (
    <>
      {minutes.map((v) => (
        <text
          x={scale(v)}
          y={0}
          key={`x-tick-${v}`}
          style={{
            pointerEvents: 'none',
            textAnchor: v === 0 ? 'start' : 'middle',
            userSelect: 'none'
          }}
        >
          {v}
        </text>
      ))}
    </>
  )
})
