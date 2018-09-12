// @flow
import React, {PureComponent} from 'react'
import {FeatureGroup} from 'react-leaflet'
import inside from '@turf/inside'
import {point} from '@turf/helpers'

import type {Feature, GTFSStop} from '../../types'

import DrawPolygon from './draw-polygon'

type Props = {
  routeStops: GTFSStop[],
  selectStops: (string[]) => void
}

/**
 * Select stops using a polygon select
 */
export default class StopSelectPolygon
  extends PureComponent<void, Props, void> {
  render () {
    return (
      <FeatureGroup>
        <DrawPolygon onPolygon={this._onPolygon} />
      </FeatureGroup>
    )
  }

  _onPolygon = (polygon: Feature) => {
    const {routeStops, selectStops} = this.props
    selectStops(
      routeStops
        .filter(s => inside(point([s.stop_lon, s.stop_lat]), polygon))
        .map(s => s.stop_id)
    )
  }
}
