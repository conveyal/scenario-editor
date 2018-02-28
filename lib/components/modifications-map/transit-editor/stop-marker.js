// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'
import {Marker, Popup} from 'react-leaflet'

import {Button} from '../../buttons'
import {NEW_SNAPPED_STOP_COLOR, NEW_STOP_COLOR} from '../../../constants'
import fontawesomeIcon from '../fontawesome-icon'

import type {LonLat} from '../../../types'

type Props = {
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

function getIcon ({snapped}) {
  if (snapped) {
    return fontawesomeIcon({icon: 'circle', color: NEW_SNAPPED_STOP_COLOR, iconSize: 16})
  } else return fontawesomeIcon({icon: 'circle', color: NEW_STOP_COLOR, iconSize: 16})
}
