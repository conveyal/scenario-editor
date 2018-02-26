// @flow
import React from 'react'
import {Marker} from 'react-leaflet'

import fontawesomeIcon from '../fontawesome-icon'

type Props = {
  bearing: number
}

export default class AutoCreatedStopMarker extends React.PureComponent {
  props: Props

  render () {
    const {bearing, ...markerProps} = this.props

    return (
      <Marker
        draggable
        icon={fontawesomeIcon({icon: 'subway', color: '#888', bearing})}
        {...markerProps}
      />
    )
  }
}
