// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'
import {Marker, Popup} from 'react-leaflet'

import {Button} from '../../buttons'
import fontawesomeIcon from '../fontawesome-icon'

import type {LonLatC} from '../../../types'

type Props = {
  position: LonLatC,

  onDelete: () => void,
  onDragend: (Event) => void,
  onToggle: () => void
}

export default class ControlPointMarker extends React.PureComponent {
  props: Props

  render () {
    const {onDelete, onDragend, onToggle, position} = this.props

    return (
      <Marker
        position={position}
        draggable
        onDragend={onDragend}
        icon={fontawesomeIcon({icon: 'circle', color: '#48f', iconSize: 16})}
      >
        <Popup>
          <div>
            <Button style='primary' onClick={onToggle}>
              {message('transitEditor.makeStop')}
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
