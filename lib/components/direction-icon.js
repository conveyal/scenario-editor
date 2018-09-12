// @flow
import {DivIcon, point} from 'leaflet'
import React, {PureComponent} from 'react'
import {Marker} from 'react-leaflet'

// in typical leaflet fashion, make a function to create the class
class LeafletDirectionIcon extends DivIcon {
  // NB nonstandard constructor name for Leaflet
  initialize ({bearing, color = '#000', iconSize = 16}) {
    super.initialize({
      html: `<i class="fa fa-arrow-up" style="font-size: ${iconSize}px; color: ${color}; transform: rotate(${bearing}deg)"></i>`,
      iconSize: point(iconSize, iconSize),
      className: 'DirectionIcon'
    })
  }
}

/**
 * An icon that is an arrow pointing in a particular direction
 */
export default class DirectionIcon extends PureComponent<Props, State> {
  render () {
    const {bearing, clickable, color, coordinates, iconSize} = this.props
    return (
      <Marker
        clickable={clickable}
        icon={new LeafletDirectionIcon({bearing, color, iconSize})}
        position={[coordinates[1], coordinates[0]]}
      />
    )
  }
}
