import {
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack
} from '@chakra-ui/react'
import {Fragment, useState, useEffect} from 'react'
import {scaleLinear} from 'd3-scale'
import {format as d3Format} from 'd3-format'

import colors from 'lib/constants/colors'
import message from 'lib/message'

import * as Panel from '../panel'

const WIDTH = 290
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

/**
 * This component renders the aggregate accessibility display (histograms and percentiles).
 */
export default function AggregateAccessibilityComponent({
  accessToName,
  aggregateAccessibility,
  comparisonAccessToName,
  comparisonAggregateAccessibility,
  comparisonRegionalAnalysisName,
  regionalAnalysisName,
  weightByName
}) {
  const [xScale, setXScale] = useState(() =>
    createXScale(aggregateAccessibility, comparisonAggregateAccessibility)
  )
  const [yScale, setYScale] = useState(() =>
    createYScale(aggregateAccessibility, comparisonAggregateAccessibility)
  )
  const [percentile, setPercentile] = useState(PERCENTILE_OF_ACCESSIBILITY)

  // Update the scales if the accessibility changes
  useEffect(() => {
    setXScale(() =>
      createXScale(aggregateAccessibility, comparisonAggregateAccessibility)
    )
    setYScale(() =>
      createYScale(aggregateAccessibility, comparisonAggregateAccessibility)
    )
  }, [aggregateAccessibility, comparisonAggregateAccessibility])

  const percentiles = aggregateAccessibility.percentiles[percentile]
  const comparisonPercentiles = comparisonAggregateAccessibility
    ? comparisonAggregateAccessibility.percentiles[percentile]
    : 0

  return (
    <Stack spacing={4}>
      <Box>
        <svg width={WIDTH} height={HEIGHT}>
          <Bins
            bins={aggregateAccessibility.bins}
            breakPoint={percentiles}
            color={colors.PROJECT_PERCENTILE_COLOR}
            xScale={xScale}
            yScale={yScale}
          />
          <XScale xScale={xScale} />
          <YScale weightByName={weightByName} yScale={yScale} />
          <PercentileLine
            color={colors.PROJECT_PERCENTILE_COLOR}
            x={xScale(percentiles)}
          />
          {comparisonAggregateAccessibility && (
            <>
              <Bins
                bins={comparisonAggregateAccessibility.bins}
                breakPoint={comparisonPercentiles}
                color={colors.COMPARISON_PERCENTILE_COLOR}
                xScale={xScale}
                yScale={yScale}
              />
              <PercentileLine
                color={colors.COMPARISON_PERCENTILE_COLOR}
                x={xScale(comparisonPercentiles)}
              />
            </>
          )}
        </svg>
      </Box>

      <FormControl pl='30px' pr='15px'>
        <FormLabel htmlFor='percentileOfAccessibility'>
          {message('analysis.selectPercentileOfAccessibility')}
        </FormLabel>
        <Slider
          id='percentileOfAccessibility'
          min={1}
          max={99}
          step={1}
          value={percentile}
          onChange={setPercentile}
        >
          <SliderTrack />
          <SliderFilledTrack />
          <SliderThumb />
        </Slider>
      </FormControl>

      <AggregateAccessibilityReadout
        name={regionalAnalysisName}
        weightByName={weightByName}
        accessToName={accessToName}
        // invert: 90th percentile of accessibility means accessibility that
        // high or greater is experienced by 10% of the population
        percentage={100 - percentile}
        accessibilityForPercentile={percentiles}
        weightedAverage={aggregateAccessibility.weightedAverage}
      />

      {comparisonAggregateAccessibility && (
        <AggregateAccessibilityReadout
          name={comparisonRegionalAnalysisName}
          weightByName={weightByName}
          accessToName={comparisonAccessToName}
          // invert: 90th percentile of accessibility means accessibility that
          // high or greater is experienced by 10% of the population
          percentage={100 - percentile}
          accessibilityForPercentile={comparisonPercentiles}
          weightedAverage={comparisonAggregateAccessibility.weightedAverage}
        />
      )}

      <Alert status='warning'>
        <AlertIcon />
        {message('analysis.weightedAverageAccessibilityWarning')}
      </Alert>
    </Stack>
  )
}

function Bins({
  bins,
  breakPoint, // where we break between the gray and colored plot
  color,
  xScale,
  yScale
}) {
  return (
    <>
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
            <Fragment key={`bin-${i}.`}>
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
            </Fragment>
          )
        }
      })}
    </>
  )
}

/**
 * Render a vertical line at the chosen percentile of accessibility
 */
function PercentileLine({color, x}) {
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

function AggregateAccessibilityReadout({
  name,
  weightByName,
  accessToName,
  percentage,
  accessibilityForPercentile,
  weightedAverage
}) {
  const fmt = d3Format(',')
  return (
    <Panel.Panel>
      <Panel.Heading>{name}</Panel.Heading>
      <Panel.Body>
        <Box px={2} pb={2}>
          {message('analysis.percentileOfAccessibility', {
            name,
            weightByName,
            accessToName,
            // invert: 90th percentile of accessibility means accessibility that high or greater is
            // experienced by 10% of the population
            percentage,
            accessibility: fmt(Math.round(accessibilityForPercentile))
          })}
        </Box>

        <Box px={2}>
          {message('analysis.weightedAverageAccessibility', {
            weightedAverage: fmt(Math.round(weightedAverage))
          })}
        </Box>
      </Panel.Body>
    </Panel.Panel>
  )
}

function createXScale(
  aggregateAccessibility,
  comparisonAggregateAccessibility
) {
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

function createYScale(
  aggregateAccessibility,
  comparisonAggregateAccessibility
) {
  const maxCount = comparisonAggregateAccessibility
    ? Math.max(
        ...[
          ...aggregateAccessibility.bins.map((b) => b.value),
          ...comparisonAggregateAccessibility.bins.map((b) => b.value)
        ]
      )
    : Math.max(...aggregateAccessibility.bins.map((b) => b.value))

  return scaleLinear()
    .domain([0, maxCount])
    .range([HEIGHT - X_SCALE_HEIGHT, 0]) // invert y, +y is down in SVG
}

function XScale({xScale}) {
  const fmt = d3Format('.3s')
  return (
    <>
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
        {message('analysis.accessibility')}
      </text>
    </>
  )
}

function YScale({weightByName, yScale}) {
  const fmt = d3Format('.3s')
  return (
    <>
      {yScale.ticks(4).map((t, i) => (
        <text
          y={0}
          x={0}
          key={`y-label-${i}`}
          style={{
            textAnchor: 'end',
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
    </>
  )
}
