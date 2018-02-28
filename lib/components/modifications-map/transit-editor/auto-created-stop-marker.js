// @flow
import React from 'react'
import {Marker} from 'react-leaflet'

import {AUTO_CREATED_STOP_COLOR} from '../../../constants'
import fontawesomeIcon from '../fontawesome-icon'

export default class AutoCreatedStopMarker extends React.PureComponent {
  render () {
    return (
      <Marker
        draggable
        icon={fontawesomeIcon({icon: 'circle', color: AUTO_CREATED_STOP_COLOR, iconSize: 12})}
        {...this.props}
      />
    )
  }
}
