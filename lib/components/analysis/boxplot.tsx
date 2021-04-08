import {memo} from 'react'

interface BoxplotProps {
  color: string
  positions: number[]
  positionIndex: number
  scale: (number) => number
  strokeWidth?: number
  width: number
}

/**
 * An svg boxplot
 */
export default memo<BoxplotProps>(function Boxplot({
  color,
  positions,
  positionIndex,
  scale,
  strokeWidth = 0.5,
  width
}) {
  const [low, iqrLow, med, iqrHigh, high] = positions
  const stroke = color

  const center = 0.5 * width
  const whiskerLeft = 0.2 * width
  const whiskerRight = 0.8 * width
  const boxLeft = 0.1 * width
  const boxRight = 0.9 * width

  return (
    <g style={{stroke, strokeWidth}}>
      {/* halo for selected percentile */}
      <line
        x1={boxLeft}
        x2={boxRight}
        y1={scale(positions[positionIndex])}
        y2={scale(positions[positionIndex])}
        style={{
          strokeWidth: 3 * strokeWidth,
          opacity: 0.4
        }}
      />
      {/* top of top whisker */}
      <line
        x1={whiskerLeft}
        x2={whiskerRight}
        y1={scale(high)}
        y2={scale(high)}
      />
      {/* top whisker */}
      <line x1={center} x2={center} y1={scale(high)} y2={scale(iqrHigh)} />
      {/* top of box */}
      <line
        x1={boxLeft}
        x2={boxRight}
        y1={scale(iqrHigh)}
        y2={scale(iqrHigh)}
      />
      {/* median in box */}
      <line
        x1={boxLeft}
        x2={boxRight}
        y1={scale(med)}
        y2={scale(med)}
        style={{stroke, strokeWidth: strokeWidth * 2}}
      />
      {/* bottom of box */}
      <line x1={boxLeft} x2={boxRight} y1={scale(iqrLow)} y2={scale(iqrLow)} />
      {/* left side of box */}
      <line x1={boxLeft} x2={boxLeft} y1={scale(iqrHigh)} y2={scale(iqrLow)} />
      {/* right side of box */}
      <line
        x1={boxRight}
        x2={boxRight}
        y1={scale(iqrHigh)}
        y2={scale(iqrLow)}
      />
      {/* bottom whisker */}
      <line x1={center} x2={center} y1={scale(iqrLow)} y2={scale(low)} />
      {/* bottom of bottom whisker */}
      <line
        x1={whiskerLeft}
        x2={whiskerRight}
        y1={scale(low)}
        y2={scale(low)}
      />
    </g>
  )
})
