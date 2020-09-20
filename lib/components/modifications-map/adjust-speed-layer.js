/** A layer for an adjust speed modification */
import React from 'react'

import colors from 'lib/constants/colors'

import PatternLayer from './pattern-layer'
import HopLayer from './hop-layer'

export default function AdjustSpeedLayer(p) {
  if (p.modification.hops) {
    return (
      <>
        <PatternLayer
          color={colors.NEUTRAL}
          dim={p.dim}
          feed={p.feed}
          modification={p.modification}
        />
        <HopLayer
          color={colors.MODIFIED}
          dim={p.dim}
          feed={p.feed}
          modification={p.modification}
        />
      </>
    )
  } else {
    return (
      <PatternLayer
        color={colors.MODIFIED}
        dim={p.dim}
        feed={p.feed}
        modification={p.modification}
      />
    )
  }
}
