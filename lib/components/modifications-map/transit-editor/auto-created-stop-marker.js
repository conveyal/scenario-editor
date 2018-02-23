// @flow
import React from 'react'
import {Marker} from 'react-leaflet'

import fontawesomeIcon from '../fontawesome-icon'

import type {LonLat} from '../../../types'

type Props = {
  bearing: number,
  position: LonLat,

  onDragend: (Event) => void
}

export default class AutoCreatedStopMarker extends React.PureComponent {
  props: Props

  render () {
    const {bearing, onDragend, position} = this.props

    return (
      <Marker
        position={position}
        draggable
        onDragend={onDragend}
        icon={fontawesomeIcon({icon: 'subway', color: '#888', bearing})}
      />
    )
  }
}
