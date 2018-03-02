// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'
import {scaleLinear} from 'd3-scale'
import {format as d3Format} from 'd3-format'
import {sprintf} from 'sprintf-js'

import colors from '../../constants/colors'
import {Slider, Group} from '../input'
import messages from '../../utils/messages'

import type {AggregateAccessibility} from '../../types'

const WIDTH = 300
const HEIGHT = 225
const X_SCALE_HEIGHT = 30
const Y_SCALE_WIDTH = 30
const FONT_SIZE = 10

/**
 * Percentile of aggregate accessibility to display. Note that this is inverted
 * from what most people might expect; the 90th percentile of accessibility
 * means that 10% of the population has access to this mean jobs (assuming you
 * are using population-weighted job accessibility).
 */
const PERCENTILE_OF_ACCESSIBILITY = 10

type Props = {
  aggregateAccessibility: AggregateAccessibility,
  comparisonAggregateAccessibility: ?AggregateAccessibility,
  weightByName: string,
  accessToName: string,
  comparisonAccessToName: void | string,
  regionalAnalysisName: string,
  comparisonRegionalAnalysisName: void | string
}

type State = {
  percentileOfAccessibility: number,
  xScale: number => number,
  yScale: number => number
}

/**
 * This component renders the aggregate accessibility display (histograms and percentiles).
 */
export default class AggregateAccessibilityComponent extends PureComponent {
  props: Props
  state: State

  state = {
    percentileOfAccessibility: PERCENTILE_OF_ACCESSIBILITY,
    xScale: createXScale(this.props),
    yScale: createYScale(this.props)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({
      xScale: createXScale(nextProps),
      yScale: createYScale(nextProps)
    })
  }

  setPercentileOfAccessibility = (e: Event & {target: {value: number}}) => {
    this.setState({percentileOfAccessibility: e.target.value})
  }

  percentiles (): number {
    const {aggregateAccessibility} = this.props
    const {percentileOfAccessibility} = this.state
    return aggregateAccessibility.percentiles[percentileOfAccessibility]
  }

  comparisonPercentiles (): number {
    const accessibility = this.props.comparisonAggregateAccessibility
    const {percentileOfAccessibility} = this.state
    return accessibility
      ? accessibility.percentiles[percentileOfAccessibility]
      : 0
  }

  render () {
    const {
      accessToName,
      aggregateAccessibility,
      comparisonAccessToName,
      comparisonAggregateAccessibility,
      comparisonRegionalAnalysisName,
      regionalAnalysisName,
      weightByName
    } = this.props
    const {percentileOfAccessibility, xScale, yScale} = this.state
    return (
      <div>
        <svg width={WIDTH} height={HEIGHT}>
          <Bins
            bins={aggregateAccessibility.bins}
            breakPoint={this.percentiles()}
            color={colors.PROJECT_PERCENTILE_COLOR}
            xScale={xScale}
            yScale={yScale}
          />
          <XScale xScale={xScale} />
          <YScale weightByName={weightByName} yScale={yScale} />
          <PercentileLine
            color={colors.PROJECT_PERCENTILE_COLOR}
            x={xScale(this.percentiles())}
          />
          {comparisonAggregateAccessibility &&
            <g>
              <Bins
                bins={comparisonAggregateAccessibility.bins}
                breakPoint={this.comparisonPercentiles()}
                color={colors.COMPARISON_PERCENTILE_COLOR}
                xScale={xScale}
                yScale={yScale}
              />
              <PercentileLine
                color={colors.COMPARISON_PERCENTILE_COLOR}
                x={xScale(this.comparisonPercentiles())}
              />
            </g>}
        </svg>
        <Group label={messages.analysis.selectPercentileOfAccessibility}>
          <Slider
            width={WIDTH - Y_SCALE_WIDTH}
            min={1}
            max={99}
            step={1}
            value={percentileOfAccessibility}
            onChange={this.setPercentileOfAccessibility}
            style={{left: Y_SCALE_WIDTH}}
          />
        </Group>
        <div>
          <AggregateAccessibilityReadout
            name={regionalAnalysisName}
            weightByName={weightByName}
            accessToName={accessToName}
            // invert: 90th percentile of accessibility means accessibility that
            // high or greater is experienced by 10% of the population
            percentage={100 - percentileOfAccessibility}
            accessibilityForPercentile={this.percentiles()}
            weightedAverage={aggregateAccessibility.weightedAverage}
          />

          {comparisonAggregateAccessibility &&
            <AggregateAccessibilityReadout
              name={comparisonRegionalAnalysisName}
              weightByName={weightByName}
              accessToName={comparisonAccessToName}
              // invert: 90th percentile of accessibility means accessibility that
              // high or greater is experienced by 10% of the population
              percentage={100 - percentileOfAccessibility}
              accessibilityForPercentile={this.comparisonPercentiles()}
              weightedAverage={comparisonAggregateAccessibility.weightedAverage}
            />}
        </div>
      </div>
    )
  }
}

function Bins ({
  bins,
  breakPoint, // where we break between the gray and colored plot
  color,
  xScale,
  yScale
}: {
  bins: {value: number, min: number, max: number}[],
  breakPoint: number,
  color: string,
  xScale: number => number,
  yScale: number => number
}) {
  return (
    <g>
      {bins.map(({min, max, value}, i) => {
        if (max < breakPoint || min > breakPoint) {
          // normal bar, all one color
          return (
            <rect
              x={xScale(min)}
              width={xScale(max) - xScale(min)}
              y={yScale(value)}
              height={yScale(0) - yScale(value)}
              style={{
                fill: min > breakPoint ? color : colors.STALE_PERCENTILE_COLOR,
                fillOpacity: 0.5
              }}
              key={`bin-${i}`}
            />
          )
        } else {
          // part of this bar is above the cutoff percentile, part below, so render two bars
          return (
            <g key={`bin-${i}.`}>
              <rect
                x={xScale(min)}
                width={xScale(breakPoint) - xScale(min)}
                y={yScale(value)}
                height={yScale(0) - yScale(value)}
                style={{
                  fill: colors.STALE_PERCENTILE_COLOR,
                  fillOpacity: 0.5
                }}
              />
              <rect
                x={xScale(breakPoint)}
                width={xScale(max) - xScale(breakPoint)}
                y={yScale(value)}
                height={yScale(0) - yScale(value)}
                style={{fill: color, fillOpacity: 0.5}}
              />
              )}
            </g>
          )
        }
      })}
    </g>
  )
}

/**
 * Render a vertical line at the chosen percentile of accessibility
 */
function PercentileLine ({color, x}) {
  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={HEIGHT - X_SCALE_HEIGHT}
      style={{stroke: color, strokeWidth: 0.5}}
    />
  )
}

function AggregateAccessibilityReadout ({
  name,
  weightByName,
  accessToName,
  percentage,
  accessibilityForPercentile,
  weightedAverage
}) {
  const fmt = d3Format(',')
  return (
    <div>
      {sprintf(messages.analysis.percentileOfAccessibility, {
        name,
        weightByName,
        accessToName,
        // invert: 90th percentile of accessibility means accessibility that high or greater is
        // experienced by 10% of the population
        percentage,
        accessibility: fmt(Math.round(accessibilityForPercentile))
      })}
      <br />
      <Icon
        type='exclamation-triangle'
        title={messages.analysis.weightedAverageAccessibilityWarning}
      />
      {sprintf(
        messages.analysis.weightedAverageAccessibility,
        fmt(Math.round(weightedAverage))
      )}
    </div>
  )
}

function createXScale (props: Props): number => number {
  const {aggregateAccessibility, comparisonAggregateAccessibility} = props

  const minAccessibility = comparisonAggregateAccessibility
    ? Math.min(
        comparisonAggregateAccessibility.minAccessibility,
        aggregateAccessibility.minAccessibility
      )
    : aggregateAccessibility.minAccessibility

  const maxAccessibility = comparisonAggregateAccessibility
    ? Math.max(
        comparisonAggregateAccessibility.maxAccessibility,
        aggregateAccessibility.maxAccessibility
      )
    : aggregateAccessibility.maxAccessibility

  return scaleLinear()
    .domain([minAccessibility, maxAccessibility])
    .range([Y_SCALE_WIDTH, WIDTH])
}

function createYScale (props: Props): number => number {
  const {aggregateAccessibility, comparisonAggregateAccessibility} = props

  const maxCount = comparisonAggregateAccessibility
    ? Math.max(
        ...[
          ...aggregateAccessibility.bins.map(b => b.value),
          ...comparisonAggregateAccessibility.bins.map(b => b.value)
        ]
      )
    : Math.max(...aggregateAccessibility.bins.map(b => b.value))

  return scaleLinear().domain([0, maxCount]).range([HEIGHT - X_SCALE_HEIGHT, 0]) // invert y, +y is down in SVG
}

function XScale ({xScale}) {
  const fmt = d3Format('.3s')
  return (
    <g>
      {xScale.ticks(4).map((t, i) => (
        <text
          x={xScale(t)}
          y={HEIGHT - FONT_SIZE * 1.5}
          style={{
            textAnchor: 'middle',
            alignmentBaseline: 'baseline',
            fontSize: FONT_SIZE
          }}
          key={`x-label-${i}`}
        >
          {fmt(t)}
        </text>
      ))}
      <text
        x={WIDTH / 2}
        y={HEIGHT}
        style={{
          textAnchor: 'middle',
          alignmentBaseline: 'ideographic',
          fontSize: FONT_SIZE
        }}
      >
        {messages.analysis.accessibility}
      </text>
    </g>
  )
}

function YScale ({weightByName, yScale}) {
  const fmt = d3Format('.3s')
  return (
    <g>
      {yScale.ticks(4).map((t, i) => (
        <text
          y={0}
          x={0}
          key={`y-label-${i}`}
          style={{
            textAnchor: 'right',
            alignmentBaseline: 'middle',
            fontSize: FONT_SIZE
          }}
          transform={`translate(${Y_SCALE_WIDTH} ${yScale(t)}) rotate(-30)`}
        >
          {fmt(t)}
        </text>
      ))}
      <text
        x={0}
        y={0}
        transform={`translate(${FONT_SIZE * 0.75} ${HEIGHT / 2}) rotate(-90)`}
        style={{
          textAnchor: 'middle',
          alignmentBaseline: 'middle',
          fontSize: FONT_SIZE
        }}
      >
        {weightByName}
      </text>
    </g>
  )
}
