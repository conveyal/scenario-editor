// @flow
import React, {Component} from 'react'
import {FeatureGroup} from 'react-leaflet'

import colors from '../../constants/colors'
import type {Feed, Modification} from '../../types'

import PatternLayer from './pattern-layer'
import HopLayer from './hop-layer'

type Props = {
  feed: Feed,
  modification: Modification
}

/** A layer for an adjust speed modification */
export default class AdjustSpeedLayer extends Component<Props> {
  render () {
    const {modification, feed, ...rest} = this.props
    if (modification.hops) {
      return (
        <FeatureGroup>
          <PatternLayer
            color={colors.NEUTRAL}
            feed={feed}
            modification={modification}
            {...rest}
          />
          <HopLayer
            color={colors.MODIFIED}
            feed={feed}
            modification={modification}
            {...rest}
          />
        </FeatureGroup>
      )
    } else {
      return (
        <PatternLayer
          color={colors.MODIFIED}
          feed={feed}
          modification={modification}
          {...rest}
        />
      )
    }
  }
}
