// @flow
import {DivIcon, point} from 'leaflet'

type Props = {
  icon: string,
  iconSize?: number,
  color: string,
  bearing?: number
}

/**
 * Render fontawesome icons as icons on a leaflet map. If a bearing is
 * specified, will add a direction.
 */
class FontawesomeIcon extends DivIcon {
  // NB nonstandard constructor name for Leaflet
  initialize ({icon, iconSize = 24, color = '#000', bearing}: Props) {
    // if there's a bearing the icon is a bit bigger than requested to make room
    const trueIconSize = bearing !== null && bearing !== undefined ? iconSize * 1.5 : iconSize

    super.initialize({
      html: bearing === undefined || bearing === null || bearing === -1
        ? `<i class="fa fa-${icon}" style="font-size: ${iconSize}px; color: ${color}"></i>`
        : `<i class="fa fa-${icon}" style="font-size: ${iconSize}px; color: ${color}"></i>
       <i class="fa fa-caret-up" style="font-size: ${iconSize}px; color: ${color}; transform-origin: 60% 135%; transform: translateY(-${iconSize * 1.75}px) rotate(${bearing}deg)"></i>`,
      iconSize: point(trueIconSize, trueIconSize),
      className: 'FontawesomeIcon'
    })
  }
}

// in typical leaflet fashion, make a function to create the class
export default function fontawesomeIcon (opts: Props) {
  return new FontawesomeIcon(opts)
}
