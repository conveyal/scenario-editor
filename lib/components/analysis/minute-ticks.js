// @flow

/** Render the minute axis ticks - shared by stacked percentile curves plot and travel time distribution plot */

import React from 'react'
import {sprintf} from 'sprintf-js'

import DeepEqualComponent from '../deep-equal'
import messages from '../../utils/messages'

// The x axis labels for the plot
const TIME_LABELS = [15, 30, 45, 60, 75, 90, 105, 120]

type Props = {
  scale (number): number,
  textHeight: number
}

export default class MinuteTicks extends DeepEqualComponent<void, Props, void> {
  render () {
    const {scale, textHeight} = this.props
    return <g>
      {/* We don't explicitly center the '15 minutes' text; fudge the left side a bit so that the 15 appears centered */}
      {TIME_LABELS.map((v, i, arr) => <text
        x={i === 0 ? scale(v) - textHeight / 2 : scale(v)}
        y={0}
        key={`x-tick-${v}`}
        style={{
          textAnchor: i === arr.length - 1
            ? 'end' // don't run off end, fudge position of last value a bit
            : i === 0
            ? 'start' // don't center the whole '15 minutes' text
            : 'middle'
        }}
        >
        {/* label first minute */}
        {i === 0 ? sprintf(messages.analysis.minutes, v) : v}
      </text>
      )}
    </g>
  }
}
