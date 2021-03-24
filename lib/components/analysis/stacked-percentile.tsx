import {format} from 'd3-format'
import {scalePow, scaleLinear, ScalePower} from 'd3-scale'
import {line, area} from 'd3-shape'
import {CSSProperties, memo} from 'react'

import {TRAVEL_TIME_PERCENTILES} from 'lib/constants'

import StackedBar from './stacked-bar'
import MinuteTicks from './minute-ticks'

export const PROJECT = 'project'
export const BASE = 'base'
export const COMPARISON = 'comparison'

// Reversed because 5th percentile travel time has the highest accessibility.
// These are also used for the breaks when viewing a single project. We specify
// the percentiles we wish to display, and then use indexOf to figure out which
// items in the response correspond to the desired percentiles. For now, only
// the percentiles we actually display are fetched, but in future we might need
// to request additional percentiles.
const BOX_PLOT_PERCENTILES = [95, 75, 50, 25, 5]
const BOX_PLOT_ITEMS = BOX_PLOT_PERCENTILES.map((p) =>
  TRAVEL_TIME_PERCENTILES.indexOf(p)
)

export const SVG_HEIGHT = 225
export const SVG_WIDTH = 600
const BARS_WIDTH_PX = 100
const BAR_WIDTH = 25
const CHART_WIDTH = SVG_WIDTH - BARS_WIDTH_PX
const TEXT_HEIGHT = 10
const TEXT_BUFFER = 10
const CHART_HEIGHT = SVG_HEIGHT - (TEXT_HEIGHT + TEXT_BUFFER)
const MAX_OPACITY = 0.6
const STROKE_WIDTH = 1.5
const MAX_TRIP_DURATION = 120
const TIME_LABELS = [0, 15, 30, 45, 60, 75, 90, 105, 120]

// The exponent of the power scale on the Y axis. Set at 0.5 for a square root
// scale, which is kind of the "natural scale" for accessibility as it would
// yield a straight line under constant travel time and opportunity density in
// all directions.
const Y_AXIS_EXPONENT = 0.5

// x scale never changes
export const xScale = scaleLinear()
  .domain([0, MAX_TRIP_DURATION])
  .range([0, SVG_WIDTH - BARS_WIDTH_PX])

type StackedPercentileProps = {
  color: string
  fontColorHex: string
  percentileIndex: number
  percentileCurves: number[][]
  yScale: ScalePower<number, number, never>
}

type StackedPercentileComparisonProps = {
  comparisonColor: string
  comparisonPercentileCurves: number[][]
}

type SlicesProps = {
  breaks: number[]
  color: string
  percentileCurves: number[][]
  yScale: (n: number) => number
}

const svgStyle: CSSProperties = {
  width: SVG_WIDTH,
  height: SVG_HEIGHT
}

const gridLineStyle = {
  stroke: '#E2E8F0',
  strokeWidth: 0.5,
  fill: 'none'
}
const tickFormat = format('.3~s')

export function SVGWrapper({children}) {
  return (
    <svg id='results-chart' style={svgStyle}>
      {children}
    </svg>
  )
}

export default memo<StackedPercentileProps>(
  ({color, fontColorHex, percentileIndex, percentileCurves, yScale}) => {
    return (
      <>
        <XAxis />

        <g style={{fill: fontColorHex}}>
          <YAxis yScale={yScale} />
        </g>

        <g transform={`translate(${SVG_WIDTH - 1.9 * BAR_WIDTH})`}>
          <StackedBar
            boxPlotItems={BOX_PLOT_ITEMS}
            color={color}
            percentileCurves={percentileCurves}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={BAR_WIDTH}
          />
        </g>

        <g
          transform={`translate(0 ${SVG_HEIGHT - 3})`}
          style={{fill: fontColorHex}}
        >
          <MinuteTicks minutes={TIME_LABELS} scale={xScale} />
        </g>

        <Slices
          breaks={BOX_PLOT_ITEMS}
          color={color}
          percentileCurves={percentileCurves}
          yScale={yScale}
        />
        <CumulativeLine
          color={color}
          curve={percentileCurves[percentileIndex]}
          yScale={yScale}
        />
      </>
    )
  }
)

/**
 * Display a stacked percentile chart.
 */
export const StackedPercentileComparison = memo<
  StackedPercentileComparisonProps & StackedPercentileProps
>(
  ({
    color,
    comparisonColor,
    comparisonPercentileCurves,
    fontColorHex,
    percentileCurves,
    percentileIndex,
    yScale
  }) => {
    return (
      <>
        <XAxis />

        <g style={{fill: fontColorHex}}>
          <YAxis yScale={yScale} />
        </g>
        <g transform={`translate(${SVG_WIDTH - 2 * BAR_WIDTH})`}>
          <StackedBar
            boxPlotItems={BOX_PLOT_ITEMS}
            color={color}
            percentileCurves={percentileCurves}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={BAR_WIDTH}
          />
        </g>

        <g transform={`translate(${SVG_WIDTH - BAR_WIDTH})`}>
          <StackedBar
            boxPlotItems={BOX_PLOT_ITEMS}
            color={comparisonColor}
            percentileCurves={comparisonPercentileCurves}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={BAR_WIDTH}
          />
        </g>

        <g
          transform={`translate(0 ${SVG_HEIGHT - 3})`}
          style={{fill: fontColorHex}}
        >
          <MinuteTicks minutes={TIME_LABELS} scale={xScale} />
        </g>

        <Slices
          breaks={BOX_PLOT_ITEMS}
          color={color}
          percentileCurves={percentileCurves}
          yScale={yScale}
        />
        <Slices
          breaks={BOX_PLOT_ITEMS}
          color={comparisonColor}
          percentileCurves={comparisonPercentileCurves}
          yScale={yScale}
        />

        <CumulativeLine
          color={color}
          curve={percentileCurves[percentileIndex]}
          yScale={yScale}
        />
        <CumulativeLine
          color={comparisonColor}
          curve={comparisonPercentileCurves[percentileIndex]}
          yScale={yScale}
        />
      </>
    )
  }
)

/**
 * Boundaries are the boundaries between slices, as array indices in
 * percentileCurves.
 */
const Slices = memo<SlicesProps>(
  ({breaks, color, percentileCurves, yScale}) => {
    // Add one to x value below to convert from 0-based array indices (index 0
    // has accessibility from 0-1 minute) to 1-based.
    const sliceArea = area()
      .x1((d, i) => xScale(i))
      .x0((d, i) => xScale(i))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))

    // a "slice" is the segment between two percentile curves
    const slices = []
    for (let slice = breaks.length - 1; slice > 0; slice--) {
      // Slice - 1 has a higher accessibility value because it is from a less
      // reliable travel time.
      const combinedValues = percentileCurves[breaks[slice]].map((d, i) => [
        d,
        percentileCurves[breaks[slice - 1]][i]
      ])
      slices.push(combinedValues)
    }

    return (
      <>
        {slices.map((d, i, a) => {
          const opacity = ((i + 2) * MAX_OPACITY) / (a.length + 2)
          return (
            <path
              key={`slice-${i}`}
              d={sliceArea(d)}
              style={{fill: color, fillOpacity: opacity}}
            />
          )
        })}
      </>
    )
  }
)

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
  yScale: ScalePower<number, number, never>
}
const YAxis = memo<YAxisProps>(({yScale}: YAxisProps) => {
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
                stroke: '#fff',
                strokeWidth: 2,
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
    // add one for the reason described above
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))

  return (
    <path
      d={percentileLine(curve)}
      style={{
        stroke: color,
        strokeOpacity: 0.75,
        strokeWidth: 1.5,
        fill: 'none'
      }}
    />
  )
}

const sliceLineStyle = {
  strokeWidth: 1,
  strokeOpacity: 0.75,
  strokeDasharray: 4
}
export function SliceLine({color, cutoff}) {
  const x = xScale(cutoff)
  return (
    <line
      x1={x}
      x2={x}
      y1={TEXT_BUFFER}
      y2={CHART_HEIGHT}
      style={{
        ...sliceLineStyle,
        stroke: color
      }}
    />
  )
}

export function createYScale(maxAccessibility: number) {
  return scalePow()
    .exponent(Y_AXIS_EXPONENT)
    .domain([0, maxAccessibility])
    .range([CHART_HEIGHT, TEXT_BUFFER])
    .nice()
}
