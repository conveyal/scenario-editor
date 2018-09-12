// @flow
import React, {PureComponent} from 'react'
import {format} from 'd3-format'
import {scalePow, scaleLinear} from 'd3-scale'
import {line, area} from 'd3-shape'

import {TRAVEL_TIME_PERCENTILES} from '../../constants'
import messages from '../../utils/messages'

import Boxplot from './boxplot'
import {PROJECT, BASE, COMPARISON} from './stacked-percentile-selector'
import MinuteTicks from './minute-ticks'

const BOX_PLOT_WIDTH = 0.1
// Reversed because 5th percentile travel time has the highest accessibility.
// These are also used for the breaks when viewing a single project. We specify
// the percentiles we wish to display, and then use indexOf to figure out which
// items in the response correspond to the desired percentiles. For now, only
// the percentiles we actually display are fetched, but in future we might need
// to request additional percentiles.
const BOX_PLOT_PERCENTILES = [95, 75, 50, 25, 5]
const BOX_PLOT_ITEMS = BOX_PLOT_PERCENTILES.map(p =>
  TRAVEL_TIME_PERCENTILES.indexOf(p)
)
const MEDIAN_POSITION = TRAVEL_TIME_PERCENTILES.indexOf(50)

// The plot gets too busy if we overlay two four-band plots. Instead, use a
// one-band plot (25th/75th pctiles)
const COMPARISON_BAND_PERCENTILES = [75, 25]
const COMPARISON_BAND_ITEMS = COMPARISON_BAND_PERCENTILES.map(p =>
  TRAVEL_TIME_PERCENTILES.indexOf(p)
)

const TEXT_HEIGHT = 10
const MAX_OPACITY = 0.5
const MAX_TRIP_DURATION = 120

// The exponent of the power scale on the Y axis. Set at 0.5 for a square root
// scale, which is kind of the "natural scale" for accessibility as it would
// yield a straight line under constant travel time and opportunity density in
// all directions.
const Y_AXIS_EXPONENT = 0.5

type Props = {
  color: any,
  comparisonColor: any,
  comparisonLabel: string,
  comparisonPercentileCurves: number[][],
  height: number,
  isochroneCutoff: number,
  label: string,
  maxAccessibility: number,
  opportunityDatasetName: string,
  percentileCurves: number[][],
  selected: string,
  width: number
}

type State = {
  xScale: number => number,
  yScale: number => number
}

/**
 * Display a stacked percentile chart.
 */
export default class StackedPercentile extends PureComponent<Props, State> {
  state = {
    xScale: createXScale(this.props.width),
    yScale: createYScale(this.props.height, this.props.maxAccessibility)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({
      xScale: createXScale(nextProps.width),
      yScale: createYScale(nextProps.height, nextProps.maxAccessibility)
    })
  }

  render () {
    const {
      width,
      height,
      percentileCurves,
      color,
      comparisonPercentileCurves,
      comparisonColor,
      selected
    } = this.props

    const {xScale} = this.state

    const boxPlotWidth = comparisonPercentileCurves
      ? BOX_PLOT_WIDTH * width / 2
      : BOX_PLOT_WIDTH * width

    return (
      <svg style={{width, height}}>
        <g>
          {
            <g
              transform={`translate(${comparisonPercentileCurves ? boxPlotWidth : 0})`}
            >
              {this.renderBoxPlot({
                percentileCurves,
                color,
                width: boxPlotWidth
              })}
            </g>
          }

          {comparisonPercentileCurves &&
            this.renderBoxPlot({
              percentileCurves: comparisonPercentileCurves,
              color: comparisonColor,
              width: boxPlotWidth
            })}

          {this.renderMainPlot()}

          {selected !== BASE &&
            this.renderCumulativeLine({
              curve: percentileCurves[MEDIAN_POSITION],
              color
            })}

          {selected !== PROJECT &&
            this.renderCumulativeLine({
              curve: comparisonPercentileCurves[MEDIAN_POSITION],
              color: comparisonColor
            })}

          {this.renderYAxis()}

          <g transform={`translate(0 ${height})`}>
            <MinuteTicks scale={xScale} textHeight={TEXT_HEIGHT} />
          </g>

          {selected === COMPARISON
            ? this.renderComparisonLegend()
            : this.renderLegend()}
          {this.renderSliceLine()}
        </g>
      </svg>
    )
  }

  /*
   * Render the curves as filled slices or as discrete curves depending on whether we're doing a
   * comparison. Filled slices are too busy when doing a comparison.
   */
  renderMainPlot () {
    const {
      percentileCurves,
      comparisonPercentileCurves,
      color,
      comparisonColor,
      selected
    } = this.props
    switch (selected) {
      case PROJECT:
        return this.renderSlices({
          percentileCurves,
          color,
          breaks: BOX_PLOT_ITEMS
        })
      case BASE:
        return this.renderSlices({
          percentileCurves: comparisonPercentileCurves,
          color: comparisonColor,
          breaks: BOX_PLOT_ITEMS
        })
      case COMPARISON:
        return (
          <g>
            {this.renderSlices({
              percentileCurves,
              color,
              breaks: COMPARISON_BAND_ITEMS
            })}
            {this.renderSlices({
              percentileCurves: comparisonPercentileCurves,
              color: comparisonColor,
              breaks: COMPARISON_BAND_ITEMS
            })}
          </g>
        )
    }
  }

  renderBoxPlot ({
    percentileCurves,
    color,
    width
  }: {
    color: any,
    percentileCurves: number[][],
    width: number
  }) {
    const {yScale} = this.state
    const {isochroneCutoff} = this.props
    const [low, iqrLow, med, iqrHigh, high] = BOX_PLOT_ITEMS.map(
      i => percentileCurves[i][isochroneCutoff - 1]
    )

    return (
      <Boxplot
        low={low}
        iqrLow={iqrLow}
        med={med}
        iqrHigh={iqrHigh}
        high={high}
        width={width}
        scale={yScale}
        color={color}
      />
    )
  }

  renderYAxis () {
    const {yScale} = this.state
    const {opportunityDatasetName, width, height} = this.props
    const tickFormat = format('.3s')

    // make sure that the top tick is not off the screen
    const maxYValueWithTextOnScreen = yScale.invert(TEXT_HEIGHT / 2)
    const trimmedYScale = scalePow()
      .exponent(Y_AXIS_EXPONENT)
      .domain([0, maxYValueWithTextOnScreen])
      .range([height, TEXT_HEIGHT / 2])

    // y scale
    const yTicks = trimmedYScale.ticks(5)

    const toRender = yTicks.map((tick, i, arr) => {
      const yoff = yScale(tick)

      const valueText = tickFormat(tick)

      // highest valued tick gets label, move ticks down a little so the middle of the text is on
      // the line.
      const tickText = i === arr.length - 1
        ? `${valueText} ${opportunityDatasetName}`
        : valueText

      return [yoff, tickText]
    })

    return (
      <g
        transform={`translate(${BOX_PLOT_WIDTH * width})`}
        style={{fontSize: TEXT_HEIGHT}}
      >
        {toRender.map(([off, text], i, arr) => (
          <text
            style={{alignmentBaseline: i === 0 ? 'baseline' : 'middle'}}
            key={`y-tick-${text}`}
            y={off}
          >
            {text}
          </text>
        ))}
      </g>
    )
  }

  // TODO put this in its own DeepEqualComponent so it is not re-rendered when the cutoff changes
  /** boundaries are the boundaries between slices, as array indices in percentileCurves */
  renderSlices ({
    percentileCurves,
    color,
    breaks
  }: {
    breaks: number[],
    color: any,
    percentileCurves: number[][]
  }) {
    const {xScale, yScale} = this.state
    // add one to x value below to convert from 0-based array indices (index 0 has accessibility from 0-1 minute)
    // to 1-based.
    const sliceArea = area()
      .x1((d, i) => xScale(i + 1))
      .x0((d, i) => xScale(i + 1))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))

    // a "slice" is the segment between two percentile curves
    const slices = []
    for (let slice = breaks.length - 1; slice > 0; slice--) {
      // slice - 1 has a higher accessibility value because it is from a less reliable travel time
      const combinedValues = percentileCurves[breaks[slice]].map((d, i) => [
        d,
        percentileCurves[breaks[slice - 1]][i]
      ])
      slices.push(combinedValues)
    }

    return (
      <g>
        {slices.map((d, i, a) => {
          const opacity = (i + 1) * MAX_OPACITY / (a.length + 1)
          return (
            <path
              key={`slice-${i}`}
              d={sliceArea(d)}
              style={{fill: color, fillOpacity: opacity}}
            />
          )
        })}
      </g>
    )
  }

  renderCumulativeLine ({curve, color}: {color: any, curve: number[]}) {
    const {xScale, yScale} = this.state
    const percentileLine = line()
      // add one for the reason described above
      .x((d, i) => xScale(i + 1))
      .y(d => yScale(d))

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

  renderSliceLine () {
    const {xScale} = this.state
    const {height, isochroneCutoff} = this.props
    return (
      <line
        x1={xScale(isochroneCutoff)}
        x2={xScale(isochroneCutoff)}
        y1={0}
        y2={height}
        style={{
          stroke: '#333',
          strokeWidth: 0.5
        }}
      />
    )
  }

  renderLegend () {
    const {selected, color, width, height, comparisonColor} = this.props

    const currentColor = selected === PROJECT ? color : comparisonColor
    const squareSize = TEXT_HEIGHT * 1.5
    const textOffset = squareSize * 1.5

    return (
      <g transform={`translate(${width * 0.9} ${height * 0.7})`}>
        <text
          x={textOffset + TEXT_HEIGHT * 2}
          y={0}
          style={{textAnchor: 'end'}}
        >
          {messages.analysis.travelTimePercentile}
        </text>
        {/* Colors */}
        {BOX_PLOT_PERCENTILES.slice(1).map((d, i, a) => (
          <rect
            x={0}
            y={i * squareSize + TEXT_HEIGHT * 1.5}
            width={squareSize}
            height={squareSize}
            key={`legend-${i}`}
            style={{
              fill: currentColor,
              fillOpacity: (i + 1) * MAX_OPACITY / (a.length + 1)
            }}
          />
        ))}
        {/* labels, subtract i from length because 95th percentile travel time should be at the bottom */}
        {BOX_PLOT_PERCENTILES.map((d: number, i: number, a: number[]) => (
          <text
            x={textOffset}
            y={(a.length - 1 - i) * squareSize + TEXT_HEIGHT * 1.5}
            key={`legend-text-${i}`}
            style={{
              alignmentBaseline: 'middle'
            }}
          >
            {d}
          </text>
        ))}
      </g>
    )
  }

  renderComparisonLegend () {
    const {
      color,
      comparisonColor,
      label,
      width,
      height,
      comparisonLabel
    } = this.props
    const squareSize = TEXT_HEIGHT * 1.5
    const textOffset = squareSize * 1.5
    const titleOffset = TEXT_HEIGHT * 1.5

    return (
      <g transform={`translate(${width * 0.9} ${height * 0.7})`}>
        <text
          x={textOffset + TEXT_HEIGHT * 2}
          y={0}
          style={{textAnchor: 'end'}}
        >
          {messages.analysis.travelTimePercentile}
        </text>

        <rect
          x={0}
          y={titleOffset}
          width={squareSize}
          height={squareSize}
          style={{
            fill: color,
            fillOpacity: 0.5 * MAX_OPACITY // value when there is only one band
          }}
        />

        <text
          x={textOffset}
          y={titleOffset}
          style={{alignmentBaseline: 'middle'}}
        >
          {/* [1] because travel time percentiles are reversed in accessibility */}
          {COMPARISON_BAND_PERCENTILES[1]}
        </text>

        <text
          x={textOffset}
          y={titleOffset + squareSize}
          style={{alignmentBaseline: 'middle'}}
        >
          {/* [1] because travel time percentiles are reversed in accessibility */}
          {COMPARISON_BAND_PERCENTILES[0]}
        </text>

        {/* variant label */}
        <text
          x={-1 * (textOffset - squareSize)}
          y={titleOffset + squareSize / 2}
          style={{
            alignmentBaseline: 'middle',
            textAnchor: 'end'
          }}
        >
          {label}
        </text>

        <rect
          x={0}
          y={titleOffset + squareSize * 3}
          width={squareSize}
          height={squareSize}
          style={{
            fill: comparisonColor,
            fillOpacity: 0.5 * MAX_OPACITY // value when there is only one band
          }}
        />

        <text
          x={textOffset}
          y={titleOffset + squareSize * 3}
          style={{alignmentBaseline: 'middle'}}
        >
          {/* [1] because travel time percentiles are reversed in accessibility */}
          {COMPARISON_BAND_PERCENTILES[1]}
        </text>

        <text
          x={textOffset}
          y={titleOffset + squareSize * 4}
          style={{alignmentBaseline: 'middle'}}
        >
          {/* [1] because travel time percentiles are reversed in accessibility */}
          {COMPARISON_BAND_PERCENTILES[0]}
        </text>

        {/* variant label */}
        <text
          x={-1 * (textOffset - squareSize)}
          y={titleOffset + squareSize * 3 + squareSize / 2}
          style={{
            alignmentBaseline: 'middle',
            textAnchor: 'end'
          }}
        >
          {comparisonLabel}
        </text>
      </g>
    )
  }
}

function createYScale (height, maxAccessibility): number => number {
  return scalePow()
    .exponent(Y_AXIS_EXPONENT)
    .domain([0, maxAccessibility])
    .range([height, 0])
}

function createXScale (width): number => number {
  return scaleLinear()
    .domain([1, MAX_TRIP_DURATION])
    .range([BOX_PLOT_WIDTH * width, width])
}
