// @flow
import {Polyline} from 'leaflet'
import React, {PureComponent} from 'react'
import {EditControl} from 'react-leaflet-draw'

import type {Feature} from '../../types'

type Props = {
  onPolygon: (Feature) => void
}

export default class DrawPolygon extends PureComponent {
  props: Props

  render () {
    return (
      <EditControl
        draw={{
          polyline: false,
          polygon: true,
          rectangle: false,
          circle: false,
          marker: false
        }}
        position='bottomright'
        onCreated={this._onCreated}
      />
    )
  }

  _onCreated = (e: Event & {layer: Polyline}) => {
    this.props.onPolygon(e.layer.toGeoJSON())
  }
}
