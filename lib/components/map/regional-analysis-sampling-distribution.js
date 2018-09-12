// @flow
import {Marker as LeafletMarker} from 'leaflet'
import React, {Component} from 'react'
import {stats} from 'science'
import {line} from 'd3-shape'
import {scaleLinear} from 'd3-scale'
import {format} from 'd3-format'
import range from 'lodash/range'
import lonlat from '@conveyal/lonlat'

import colors from '../../constants/colors'
import type {LonLat} from '../../types'

import DraggablePopup from './draggable-popup'

const WIDTH = 400
const HEIGHT = 200
const SCALE_HEIGHT = 15

type Props = {
  _id: string,
  comparisonId: ?string,
  comparisonSamplingDistribution: ?(number[]),
  origin: LonLat,
  samplingDistribution: number[],
  setRegionalAnalysisOrigin: () => void
}

type State = {
  comparisonEstimate: number[][] | null,
  estimate: number[][],
  xScale: scaleLinear,
  yScale: scaleLinear
}

/**
 * Displays the bootstrap sampling distribution for a selected point
 */
export default class RegionalAnalysisSamplingDistribution
  extends Component<void, Props, State> {
  state = precomputeScales(this.props)

  componentWillReceiveProps (nextProps: Props) {
    this.setState(precomputeScales(nextProps))
  }

  _remove = () => {
    this.props.setRegionalAnalysisOrigin(null)
  }

  render () {
    const {
      comparisonSamplingDistribution,
      origin,
      samplingDistribution
    } = this.props
    const {comparisonEstimate, estimate, xScale, yScale} = this.state
    const fmt = format(',')
    return (
      <DraggablePopup
        position={origin}
        dragEnd={this.dragEnd}
        remove={this._remove}
        minWidth={WIDTH}
      >
        <svg width={WIDTH} height={HEIGHT}>
          <KernelDensity
            color={colors.PROJECT_PERCENTILE_COLOR}
            estimate={estimate}
            xScale={xScale}
            yScale={yScale}
          />
          <PointEstimate
            color={colors.PROJECT_PERCENTILE_COLOR}
            x={xScale(samplingDistribution[0])}
          />

          {comparisonSamplingDistribution &&
            comparisonEstimate &&
            <KernelDensity
              color={colors.COMPARISON_PERCENTILE_COLOR}
              estimate={comparisonEstimate}
              xScale={xScale}
              yScale={yScale}
            />}
          {comparisonSamplingDistribution &&
            <PointEstimate
              color={colors.COMPARISON_PERCENTILE_COLOR}
              x={xScale(comparisonSamplingDistribution[0])}
            />}
          <g transform={`translate(0 ${HEIGHT - SCALE_HEIGHT / 4})`}>
            {xScale.ticks(5).map(tick => (
              <text
                x={xScale(tick)}
                y={0}
                style={{fontSize: SCALE_HEIGHT * 0.8}}
                alignmentBaseline='baseline'
                textAnchor='middle'
              >
                {fmt(tick)}
              </text>
            ))}
          </g>
        </svg>
      </DraggablePopup>
    )
  }

  dragEnd = (e: Event & {target: LeafletMarker}): void => {
    const {setRegionalAnalysisOrigin, comparisonId, _id} = this.props
    setRegionalAnalysisOrigin({
      regionalAnalysisId: _id,
      comparisonRegionalAnalysisId: comparisonId,
      lonlat: lonlat(e.target.getLatLng())
    })
  }
}

function precomputeScales ({
  samplingDistribution,
  comparisonSamplingDistribution
}: Props): State {
  const min = Math.min(
    ...samplingDistribution,
    ...(comparisonSamplingDistribution || [])
  )
  const max = Math.max(
    ...samplingDistribution,
    ...(comparisonSamplingDistribution || [])
  )

  const xScale = scaleLinear()
    .domain([min * 0.97, max * 1.03])
    .range([0, WIDTH])

  const estimate = stats.kde().sample(samplingDistribution)(
    range(WIDTH).map(xScale.invert)
  )

  const comparisonEstimate = comparisonSamplingDistribution
    ? stats.kde().sample(comparisonSamplingDistribution)(
      range(WIDTH).map(xScale.invert)
    )
    : null

  const estimateMax = Math.max(
    ...estimate.map(i => i[1]),
    ...(comparisonEstimate || []).map(i => i[1])
  )

  /**
   * Compute the Y scale given KDE estimates of the sampling distribution and
   * optionally the comparison sampling distribution
   */
  const yScale = scaleLinear()
    .domain([0, estimateMax * 1.1])
    .range([HEIGHT - SCALE_HEIGHT, 0]) // +y is down in SVG, flip the y axis

  return {
    xScale,
    yScale,
    estimate,
    comparisonEstimate
  }
}

/**
 * Render the kernel density estimate of the sampling distribution
 */
function KernelDensity ({color, estimate, xScale, yScale}) {
  const kdeLine = line().x(([x]) => xScale(x)).y(([, y]) => yScale(y))

  return (
    <g>
      <path
        d={kdeLine(estimate)}
        style={{strokeWidth: 0.5, stroke: color, fillOpacity: 0}}
      />
    </g>
  )
}

function PointEstimate ({color, x}) {
  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={HEIGHT - SCALE_HEIGHT}
      style={{stroke: color, strokeWidth: 0.3}}
    />
  )
}
