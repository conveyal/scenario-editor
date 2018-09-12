// @flow
import React, {PureComponent} from 'react'
import {FeatureGroup} from 'react-leaflet'
import inside from '@turf/inside'
import {point} from '@turf/helpers'

import type {Feature, GTFSStop} from '../../types'

import DrawPolygon from './draw-polygon'

type Props = {
  hopStops: GTFSStop[][],
  selectHops(string[][]): void
}

/**
 * Select stops using a polygon select
 */
export default class HopSelectPolygon extends PureComponent<void, Props, void> {
  render () {
    return (
      <FeatureGroup>
        <DrawPolygon onPolygon={this._onPolygon} />
      </FeatureGroup>
    )
  }

  _onPolygon = (polygon: Feature) => {
    const {hopStops, selectHops} = this.props
    selectHops(
      hopStops
        .filter(
          hop =>
            inside(point([hop[0].stop_lon, hop[0].stop_lat]), polygon) &&
            inside(point([hop[1].stop_lon, hop[1].stop_lat]), polygon)
        )
        .map(hop => [hop[0].stop_id, hop[1].stop_id])
    )
  }
}
