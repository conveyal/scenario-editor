import {format} from 'd3-format'
import {scaleSqrt, scaleLinear, ScalePower} from 'd3-scale'
import {line, area} from 'd3-shape'
import {CSSProperties, memo} from 'react'

import colors from 'lib/constants/colors'

import StackedBar from './stacked-bar'
import MinuteTicks from './minute-ticks'

export const PROJECT = 'project'
export const BASE = 'base'
export const COMPARISON = 'comparison'

export const SVG_HEIGHT = 225
export const SVG_WIDTH = 600
export const STROKE_WIDTH = 1.5
const BARS_WIDTH_PX = 100
const BAR_WIDTH = 30
const CHART_WIDTH = SVG_WIDTH - BARS_WIDTH_PX
const TEXT_HEIGHT = 10
const TEXT_BUFFER = 10
const CHART_HEIGHT = SVG_HEIGHT - (TEXT_HEIGHT + TEXT_BUFFER)
const MAX_TRIP_DURATION = 120
const TIME_LABELS = [0, 15, 30, 45, 60, 75, 90, 105, 120]
const MIN_OPACITY = 0.1
const STROKE_OPACITY = 0.75

/**
 * Use a square root scale, which is kind of the "natural scale" for accessibility
 * as it would yield a straight line under constant travel time and opportunity density in
 * all directions.
 */
export function createYScale(maxAccessibility: number) {
  return scaleSqrt()
    .domain([0, maxAccessibility])
    .range([CHART_HEIGHT, TEXT_BUFFER])
    .nice()
}

// x scale never changes
export const xScale = scaleLinear()
  .domain([0, MAX_TRIP_DURATION])
  .range([0, SVG_WIDTH - BARS_WIDTH_PX])

interface StackedPercentileProps {
  backgroundColorHex: string
  fontColorHex: string
  percentileIndex: number
  percentileCurves: number[][]
  yScale: ScalePower<number, number, never>
}

interface StackedPercentileComparisonProps extends StackedPercentileProps {
  comparisonPercentileCurves: number[][]
}

type SlicesProps = {
  color: string
  percentileCurves: number[][]
  yScale: (n: number) => number
}

const svgStyle: CSSProperties = {
  width: SVG_WIDTH,
  height: SVG_HEIGHT
}

const gridLineStyle = {
  stroke: '#E2E8F0', // Same as the default Chakra border color
  strokeWidth: 0.5,
  fill: 'none'
}

const tickFormat = format('.3~s') // Format results in: 1M, 160k

export function SVGWrapper({children}) {
  return (
    <svg id='results-chart' style={svgStyle}>
      {children}
    </svg>
  )
}

export default memo<StackedPercentileProps>((p) => (
  <>
    <XAxis />

    <g style={{fill: p.fontColorHex}}>
      <YAxis backgroundColorHex={p.backgroundColorHex} yScale={p.yScale} />
    </g>

    <g transform={`translate(${SVG_WIDTH - 2 * BAR_WIDTH})`}>
      <StackedBar
        color={colors.PROJECT_PERCENTILE_COLOR}
        minOpacity={MIN_OPACITY}
        percentileCurves={p.percentileCurves}
        percentileIndex={p.percentileIndex}
        scale={p.yScale}
        strokeWidth={STROKE_WIDTH}
        width={BAR_WIDTH}
      />
    </g>

    <g
      transform={`translate(0 ${SVG_HEIGHT - 3})`}
      style={{fill: p.fontColorHex}}
    >
      <MinuteTicks minutes={TIME_LABELS} scale={xScale} />
    </g>

    <Slices
      color={colors.PROJECT_PERCENTILE_COLOR}
      percentileCurves={p.percentileCurves}
      yScale={p.yScale}
    />
    <CumulativeLine
      color={colors.PROJECT_PERCENTILE_COLOR}
      curve={p.percentileCurves[p.percentileIndex]}
      yScale={p.yScale}
    />
  </>
))

/**
 * Display a stacked percentile chart.
 */
export const StackedPercentileComparison = memo<StackedPercentileComparisonProps>(
  (p) => (
    <>
      <XAxis />

      <g style={{fill: p.fontColorHex}}>
        <YAxis backgroundColorHex={p.backgroundColorHex} yScale={p.yScale} />
      </g>

      <g transform={`translate(${SVG_WIDTH - 2 * BAR_WIDTH})`}>
        <StackedBar
          color={colors.PROJECT_PERCENTILE_COLOR}
          minOpacity={MIN_OPACITY}
          percentileCurves={p.percentileCurves}
          percentileIndex={p.percentileIndex}
          scale={p.yScale}
          strokeWidth={STROKE_WIDTH}
          width={BAR_WIDTH}
        />
      </g>

      <g transform={`translate(${SVG_WIDTH - BAR_WIDTH})`}>
        <StackedBar
          color={colors.COMPARISON_PERCENTILE_COLOR}
          minOpacity={MIN_OPACITY}
          percentileCurves={p.comparisonPercentileCurves}
          percentileIndex={p.percentileIndex}
          scale={p.yScale}
          strokeWidth={STROKE_WIDTH}
          width={BAR_WIDTH}
        />
      </g>

      <g
        transform={`translate(0 ${SVG_HEIGHT - 3})`}
        style={{fill: p.fontColorHex}}
      >
        <MinuteTicks minutes={TIME_LABELS} scale={xScale} />
      </g>

      <Slices
        color={colors.COMPARISON_PERCENTILE_COLOR}
        percentileCurves={p.comparisonPercentileCurves}
        yScale={p.yScale}
      />
      <Slices
        color={colors.PROJECT_PERCENTILE_COLOR}
        percentileCurves={p.percentileCurves}
        yScale={p.yScale}
      />

      <CumulativeLine
        color={colors.COMPARISON_PERCENTILE_COLOR}
        curve={p.comparisonPercentileCurves[p.percentileIndex]}
        yScale={p.yScale}
      />
      <CumulativeLine
        color={colors.PROJECT_PERCENTILE_COLOR}
        curve={p.percentileCurves[p.percentileIndex]}
        yScale={p.yScale}
      />
    </>
  )
)

/**
 * Boundaries are the boundaries between slices, as array indices in
 * percentileCurves.
 */
const Slices = memo<SlicesProps>(({color, percentileCurves, yScale}) => {
  const sliceArea = area()
    .x((_, i) => xScale(i))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))

  // a "slice" is the segment between two percentile curves
  const slices: [number, number][][] = []
  for (let slice = 1; slice < percentileCurves.length; slice++) {
    const combinedValues: [number, number][] = percentileCurves[
      slice
    ].map((d, i) => [d, percentileCurves[slice - 1][i]])
    slices.push(combinedValues)
  }

  // Add the full area under
  slices.push(percentileCurves[percentileCurves.length - 1].map((d) => [0, d]))

  return (
    <>
      {slices.map((slice, i) => {
        const opacity = (i + 1) * MIN_OPACITY
        return (
          <path
            key={`slice-${i}`}
            d={sliceArea(slice)}
            style={{
              fill: color,
              fillOpacity: opacity
            }}
          />
        )
      })}
    </>
  )
})

const XAxis = memo(() => (
  <>
    {TIME_LABELS.map((t) => (
      <line
        key={t}
        x1={xScale(t)}
        x2={xScale(t)}
        y1={TEXT_BUFFER}
        y2={CHART_HEIGHT}
        style={gridLineStyle}
      />
    ))}
  </>
))

type YAxisProps = {
  backgroundColorHex: string
  yScale: ScalePower<number, number, never>
}
const YAxis = memo<YAxisProps>(({backgroundColorHex, yScale}: YAxisProps) => {
  // y scale
  const yTicks = yScale.ticks(6)

  return (
    <g
      style={{
        fontSize: TEXT_HEIGHT
      }}
    >
      {yTicks.map((tick) => {
        const y = yScale(tick)
        const yText = tickFormat(tick)
        return (
          <g key={`y-tick-${tick}`}>
            <line x1={0} x2={SVG_WIDTH} y1={y} y2={y} style={gridLineStyle} />
            <text
              style={{
                alignmentBaseline: 'middle',
                stroke: backgroundColorHex,
                strokeWidth: 2, // Adds an outline
                userSelect: 'none'
              }}
              x={CHART_WIDTH + TEXT_BUFFER}
              y={y}
            >
              {yText}
            </text>
            <text
              style={{
                alignmentBaseline: 'middle',
                userSelect: 'none'
              }}
              x={CHART_WIDTH + TEXT_BUFFER}
              y={y}
            >
              {yText}
            </text>
          </g>
        )
      })}
    </g>
  )
})

function CumulativeLine({color, curve, yScale}) {
  const percentileLine = line()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))

  return (
    <path
      d={percentileLine(curve)}
      style={{
        stroke: color,
        strokeOpacity: STROKE_OPACITY,
        strokeWidth: STROKE_WIDTH,
        fill: 'none'
      }}
    />
  )
}

const cutoffLineStyle = {
  strokeWidth: STROKE_WIDTH,
  strokeOpacity: STROKE_OPACITY,
  strokeDasharray: 4
}
export function CutoffLine({cutoff}: {cutoff: number}) {
  return (
    <line
      x1={cutoff}
      x2={cutoff}
      y1={TEXT_BUFFER}
      y2={CHART_HEIGHT}
      style={cutoffLineStyle}
    />
  )
}
