// @flow
import React, {Component} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {Icon} from 'leaflet'
import {toLeaflet} from '@conveyal/lonlat'

// a completely transparent, 1x1 pixel png, used to hide the marker
const TRANSPARENT_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYNESIQywfQ+QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII='

const ICON = new Icon({
  iconUrl: TRANSPARENT_PNG,
  iconSize: 1,
  popupAnchor: [0, -48]
})

export default class DraggablePopup extends Component<Props, State> {
  render () {
    // remove and drag aren't used here but they shouldn't be passed into the popup
    const {position, children, remove, drag, dragEnd, ...rest} = this.props

    return (
      <span>
        <Marker
          position={toLeaflet(position)}
          draggable
          onDrag={drag}
          onDragend={dragEnd}
        />
        <DefaultOpenMarker
          position={toLeaflet(position)}
          onPopupClose={this.remove}
          icon={ICON}
        >
          <Popup {...rest}>
            {children}
          </Popup>
        </DefaultOpenMarker>
      </span>
    )
  }

  remove = () => {
    // yuck, if we remove at the same time the popupclosed event is fired, we
    // get an error because leaflet and react are both changing the dom
    // simulataneously. Set a timeout on removing the component so that leaflet
    // can get out of the way. Otherwise, react explodes when you try to open
    // this component again.
    setTimeout(this.props.remove, 50)
  }
}

// https://stackoverflow.com/questions/38730152
class DefaultOpenMarker extends Marker {
  componentDidMount () {
    super.componentDidMount()
    this.leafletElement.openPopup()
  }
}
