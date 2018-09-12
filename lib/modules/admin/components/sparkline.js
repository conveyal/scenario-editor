// @flow
import React from 'react'
import {Sparklines} from 'react-sparklines'

const COLOR = '#fff'
const HEIGHT = 12
const MARGIN = 1
const MIN = 0
const OPACITY = 0.3

const REFERENCE_LINE_STYLE = {
  stroke: '#c92336',
  strokeOpacity: 0.75,
  strokeDasharray: '2, 2'
}

class SparklinesLine extends React.Component<Props, State> {
  render () {
    const {points, height, margin} = this.props
    const linePoints = points.map(p => [p.x, p.y]).reduce((a, b) => a.concat(b))

    const closePolyPoints = [
      points[points.length - 1].x,
      height - margin,
      margin,
      height - margin,
      margin,
      points[0].y
    ]

    const fillPoints = linePoints.concat(closePolyPoints)

    const lineStyle = {
      stroke: COLOR,
      strokeWidth: '1',
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
      fill: 'none'
    }
    const fillStyle = {
      stroke: 'none',
      strokeWidth: '0',
      fillOpacity: OPACITY,
      fill: COLOR,
      pointerEvents: 'auto'
    }

    return (
      <g>
        <polyline points={fillPoints.join(' ')} style={fillStyle} />
        <polyline points={linePoints.join(' ')} style={lineStyle} />
      </g>
    )
  }
}

function ReferenceLine (p) {
  return (
    <line
      x1={p.points[0].x} y1={p.y}
      x2={p.points[p.points.length - 1].x} y2={p.y}
      style={REFERENCE_LINE_STYLE}
    />
  )
}

type SparklineProps = {
  data: number[],
  max: number,
  reference?: number,
  width: number
}

export default function Sparkline ({
  data,
  reference,
  max,
  width
}: SparklineProps) {
  const vfactor = (HEIGHT - MARGIN * 2) / ((max - MIN) || 2)
  return <Sparklines
    data={data}
    margin={MARGIN}
    min={MIN}
    height={HEIGHT}
    width={width}>
    <SparklinesLine />
    {reference
      ? <ReferenceLine y={(max - reference) * vfactor + MARGIN} />
      : <g />}
  </Sparklines>
}
