// @flow
/** An svg boxplot */

import React from 'react'
import DeepEqualComponent from '../deep-equal'

import type {Quintiles} from '../../types'

type Props = Quintiles & {
  width: number,
  scale(number): number,
  color: any
}

export default class Boxplot extends DeepEqualComponent<void, Props, void> {
  render () {
    const {width, low, iqrLow, med, iqrHigh, high, color, scale} = this.props

    const style = {
      stroke: color,
      strokeWidth: 0.5
    }

    const center = 0.5 * width
    const whiskerLeft = 0.2 * width
    const whiskerRight = 0.8 * width
    const boxLeft = 0.1 * width
    const boxRight = 0.9 * width

    return <g style={style}>
      {/* top of top whisker */}
      <line x1={whiskerLeft} x2={whiskerRight} y1={scale(high)} y2={scale(high)} />

      {/* top whisker */}
      <line x1={center} x2={center} y1={scale(high)} y2={scale(iqrHigh)} />}

      {/* top of box */ }
      <line x1={boxLeft} x2={boxRight} y1={scale(iqrHigh)} y2={scale(iqrHigh)} />

      {/* median in box */}
      <line
        x1={boxLeft}
        x2={boxRight}
        y1={scale(med)}
        y2={scale(med)}
        style={{...style, strokeWidth: style.strokeWidth * 2}}
      />

      {/* bottom of box */}
      <line x1={boxLeft} x2={boxRight} y1={scale(iqrLow)} y2={scale(iqrLow)} />

      {/* left side of box */}
      <line x1={boxLeft} x2={boxLeft} y1={scale(iqrHigh)} y2={scale(iqrLow)} />

      {/* right side of box */}
      <line x1={boxRight} x2={boxRight} y1={scale(iqrHigh)} y2={scale(iqrLow)} />

      {/* bottom whisker */}
      <line x1={center} x2={center} y1={scale(iqrLow)} y2={scale(low)} />

      {/* bottom of bottom whisker */}
      <line x1={whiskerLeft} x2={whiskerRight} y1={scale(low)} y2={scale(low)} />
    </g>
  }
}
