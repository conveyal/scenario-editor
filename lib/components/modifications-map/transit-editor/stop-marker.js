// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'
import {Marker, Popup} from 'react-leaflet'

import {Button} from '../../buttons'
import fontawesomeIcon from '../fontawesome-icon'

import type {LonLat} from '../../../types'

type Props = {
  bearing: number,
  position: LonLat,
  snapped: boolean,

  onDelete: () => void,
  onDragend: (Event) => void,
  onToggle: () => void
}

export default class StopMarker extends React.PureComponent {
  props: Props

  render () {
    const {onDelete, onDragend, onToggle, position} = this.props

    return (
      <Marker
        position={position}
        draggable
        onDragend={onDragend}
        icon={getIcon(this.props)}
      >
        <Popup>
          <div>
            <Button style='primary' onClick={onToggle}>
              {message('transitEditor.makeControlPoint')}
            </Button>&nbsp;
            <Button style='danger' onClick={onDelete}>
              {message('transitEditor.deletePoint')}
            </Button>
          </div>
        </Popup>
      </Marker>
    )
  }
}

function getIcon ({bearing, snapped}) {
  if (snapped) {
    return fontawesomeIcon({icon: 'subway', color: '#48f', bearing})
  } else return fontawesomeIcon({icon: 'subway', color: '#000', bearing})
}
