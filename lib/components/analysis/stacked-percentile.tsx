import {format} from 'd3-format'
import {scalePow, scaleLinear} from 'd3-scale'
import {line, area} from 'd3-shape'
import {memo, useEffect, useState} from 'react'

import {TRAVEL_TIME_PERCENTILES} from 'lib/constants'

import StackedBar from './stacked-bar'
import MinuteTicks from './minute-ticks'

export const PROJECT = 'project'
export const BASE = 'base'
export const COMPARISON = 'comparison'

const BARS_WIDTH_PX = 100

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

// Helper function. Pass results directly to a `BoxPlot`
const getBoxPlotPositions = (percentileCurves, isochroneCutoff: number) =>
  BOX_PLOT_ITEMS.map((i) => percentileCurves[i][isochroneCutoff - 1])

// The plot gets too busy if we overlay two four-band plots. Instead, use a
// one-band plot (5th/95th pctiles)
const COMPARISON_BAND_PERCENTILES = [95, 5]
const COMPARISON_BAND_ITEMS = COMPARISON_BAND_PERCENTILES.map((p) =>
  TRAVEL_TIME_PERCENTILES.indexOf(p)
)

const TEXT_HEIGHT = 10
const MAX_OPACITY = 0.6
const STROKE_WIDTH = 1
const MAX_TRIP_DURATION = 120

// The exponent of the power scale on the Y axis. Set at 0.5 for a square root
// scale, which is kind of the "natural scale" for accessibility as it would
// yield a straight line under constant travel time and opportunity density in
// all directions.
const Y_AXIS_EXPONENT = 0.5

type StackedPercentileProps = {
  color: string
  cutoff: number
  fontColorHex: string
  height: number
  maxAccessibility: number
  opportunityDatasetName: string
  percentileIndex: number
  percentileCurves: number[][]
  width: number
}

type StackedPercentileComparisonProps = {
  comparisonColor: string
  comparisonLabel: string
  comparisonPercentileCurves: number[][]
  label: string
}

type SlicesProps = {
  breaks: number[]
  color: string
  percentileCurves: number[][]
  xScale: (number) => number
  yScale: (number) => number
}

export default memo<StackedPercentileProps>(
  ({
    color,
    cutoff,
    fontColorHex,
    height,
    maxAccessibility,
    percentileIndex,
    percentileCurves,
    width
  }) => {
    const [xScale] = useState(() => createXScale(width)) // width never changes
    const [yScale, setYScale] = useState(() =>
      createYScale(height, maxAccessibility)
    )

    useEffect(() => {
      setYScale(() => createYScale(height, maxAccessibility))
    }, [height, maxAccessibility])

    if (percentileCurves == null) {
      console.error(
        'Percentile curves do not exist. Cannot render StackedPercentile graph.'
      )
      return null
    }

    return (
      <svg id='results-chart' style={{width, height, marginTop: '10px'}}>
        <g transform={`translate(${width - BARS_WIDTH_PX / 2})`}>
          <StackedBar
            color={color}
            positions={getBoxPlotPositions(percentileCurves, cutoff)}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={1.5 * TEXT_HEIGHT}
          />
        </g>

        <Slices
          breaks={BOX_PLOT_ITEMS}
          color={color}
          percentileCurves={percentileCurves}
          xScale={xScale}
          yScale={yScale}
        />
        <CumulativeLine
          color={color}
          curve={percentileCurves[percentileIndex]}
          xScale={xScale}
          yScale={yScale}
        />

        <YAxis fontColor={fontColorHex} height={height} yScale={yScale} />

        <g
          transform={`translate(0 ${height - TEXT_HEIGHT})`}
          style={{fill: fontColorHex}}
        >
          <MinuteTicks
            label={false}
            hanging={true}
            scale={xScale}
            textHeight={TEXT_HEIGHT}
          />
        </g>

        <Legend
          color={color}
          comparisonColor={color}
          comparison={false}
          fontColor={fontColorHex}
          height={height}
          width={width}
        />

        <SliceLine cutoff={cutoff} height={height} xScale={xScale} />
      </svg>
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
    cutoff,
    fontColorHex,
    height,
    maxAccessibility,
    percentileCurves,
    percentileIndex,
    width
  }) => {
    const [xScale] = useState(() => createXScale(width)) // width never changes
    const [yScale, setYScale] = useState(() =>
      createYScale(height, maxAccessibility)
    )

    useEffect(() => {
      setYScale(() => createYScale(height, maxAccessibility))
    }, [height, maxAccessibility])

    if (percentileCurves == null || comparisonPercentileCurves == null) {
      console.error(
        'Percentile curves do not exist. Cannot render StackedPercentileComparison graph.'
      )
      return null
    }

    return (
      <svg id='results-chart' style={{width, height, marginTop: '10px'}}>
        <g transform={`translate(${width - 0.6 * BARS_WIDTH_PX})`}>
          <StackedBar
            color={color}
            positions={getBoxPlotPositions(percentileCurves, cutoff)}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={1.5 * TEXT_HEIGHT}
          />
        </g>

        <g transform={`translate(${width - 0.4 * BARS_WIDTH_PX})`}>
          <StackedBar
            color={comparisonColor}
            positions={getBoxPlotPositions(comparisonPercentileCurves, cutoff)}
            positionIndex={BOX_PLOT_PERCENTILES.length - 1 - percentileIndex}
            scale={yScale}
            strokeWidth={STROKE_WIDTH}
            width={1.5 * TEXT_HEIGHT}
          />
        </g>

        <Slices
          breaks={COMPARISON_BAND_ITEMS}
          color={color}
          percentileCurves={percentileCurves}
          xScale={xScale}
          yScale={yScale}
        />
        <Slices
          breaks={COMPARISON_BAND_ITEMS}
          color={comparisonColor}
          percentileCurves={comparisonPercentileCurves}
          xScale={xScale}
          yScale={yScale}
        />

        <CumulativeLine
          color={color}
          curve={percentileCurves[percentileIndex]}
          xScale={xScale}
          yScale={yScale}
        />
        <CumulativeLine
          color={comparisonColor}
          curve={comparisonPercentileCurves[percentileIndex]}
          xScale={xScale}
          yScale={yScale}
        />

        <YAxis fontColor={fontColorHex} height={height} yScale={yScale} />

        <g transform={`translate(0 ${height})`} style={{fill: fontColorHex}}>
          <MinuteTicks label={false} scale={xScale} textHeight={TEXT_HEIGHT} />
        </g>

        <Legend
          color={color}
          comparisonColor={comparisonColor}
          comparison={true}
          fontColor={fontColorHex}
          height={height}
          width={width}
        />

        <SliceLine cutoff={cutoff} height={height} xScale={xScale} />
      </svg>
    )
  }
)

/**
 * Boundaries are the boundaries between slices, as array indices in
 * percentileCurves.
 */
const Slices = memo<SlicesProps>(
  ({breaks, color, percentileCurves, xScale, yScale}) => {
    // Add one to x value below to convert from 0-based array indices (index 0
    // has accessibility from 0-1 minute) to 1-based.
    const sliceArea = area()
      .x1((d, i) => xScale(i + 1))
      .x0((d, i) => xScale(i + 1))
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

function YAxis({fontColor, height, yScale}) {
  const tickFormat = format('.3s')

  // make sure that the top tick is not off the screen
  const maxYValueWithTextOnScreen = yScale.invert(TEXT_HEIGHT / 2)
  const trimmedYScale = scalePow()
    .exponent(Y_AXIS_EXPONENT)
    .domain([0, maxYValueWithTextOnScreen])
    .range([height, TEXT_HEIGHT / 2])

  // y scale
  const yTicks = trimmedYScale.ticks(5)

  const toRender = yTicks.map((tick) => {
    const yoff = yScale(tick)

    const tickText = tickFormat(tick)

    return [yoff, tickText]
  })

  return (
    <g style={{fontSize: TEXT_HEIGHT}}>
      {toRender.map(([off, text], i) => (
        <text
          style={{
            alignmentBaseline: i === 0 ? 'baseline' : 'middle',
            fill: fontColor
          }}
          key={`y-tick-${text}`}
          y={off}
        >
          {text}
        </text>
      ))}
    </g>
  )
}

function CumulativeLine({color, curve, xScale, yScale}) {
  const percentileLine = line()
    // add one for the reason described above
    .x((d, i) => xScale(i + 1))
    .y((d) => yScale(d))

  return (
    <path
      d={percentileLine(curve)}
      style={{
        stroke: color,
        strokeWidth: 0.5,
        fill: 'none'
      }}
    />
  )
}

function SliceLine({cutoff, height, xScale}) {
  return (
    <line
      x1={xScale(cutoff)}
      x2={xScale(cutoff)}
      y1={0}
      y2={height}
      style={{
        stroke: '#333',
        strokeWidth: 0.5
      }}
    />
  )
}

function Legend({
  color,
  fontColor,
  width,
  height,
  comparison,
  comparisonColor
}) {
  const squareSize = TEXT_HEIGHT * 1.5
  const textOffset = squareSize * -0.1

  return (
    <g transform={`translate(${width - BARS_WIDTH_PX} ${height * 0.6})`}>
      {/* Labels, subtract i from length because 95th percentile is at the bottom */}
      {BOX_PLOT_PERCENTILES.map((d, i, a) => (
        <text
          x={textOffset}
          y={(a.length - 1 - i) * squareSize + TEXT_HEIGHT * 1.5}
          key={`legend-text-${i}`}
          style={{
            alignmentBaseline: 'middle',
            textAnchor: 'end',
            fill: fontColor
          }}
        >
          {d}
        </text>
      ))}
      {/* Colors */}
      {BOX_PLOT_PERCENTILES.map((d, i, a) => (
        <rect
          x={0}
          y={i * squareSize + TEXT_HEIGHT * 0.5}
          width={squareSize}
          height={squareSize}
          key={`legend-${i}`}
          style={{
            fill: color,
            fillOpacity: ((i + 2) * MAX_OPACITY) / (a.length + 1)
          }}
        />
      ))}
      {comparison &&
        BOX_PLOT_PERCENTILES.map((d, i, a) => (
          <rect
            x={squareSize * 1.1}
            y={i * squareSize + TEXT_HEIGHT * 0.5}
            width={squareSize}
            height={squareSize}
            key={`legend-${i}`}
            style={{
              fill: comparisonColor,
              fillOpacity: ((i + 2) * MAX_OPACITY) / (a.length + 1)
            }}
          />
        ))}
    </g>
  )
}

function createYScale(height: number, maxAccessibility: number) {
  return scalePow()
    .exponent(Y_AXIS_EXPONENT)
    .domain([0, maxAccessibility])
    .range([height - TEXT_HEIGHT, 0])
}

function createXScale(width: number) {
  return scaleLinear()
    .domain([0, MAX_TRIP_DURATION])
    .range([0, width - BARS_WIDTH_PX - 5])
}
