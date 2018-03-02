// @flow
import memoize from 'lodash/memoize'
import Leaflet from 'leaflet'

type Props = {
  icon: string,
  iconSize?: number,
  color: string,
}

// in typical leaflet fashion, make a function to create the class
function fontawesomeIcon ({icon, iconSize = 24, color = '#000'}: Props) {
  return Leaflet.divIcon({
    html: `<i class="fa fa-${icon}" style="font-size: ${iconSize}px; color: ${color}; background-color: #fff; border-radius: ${iconSize}px"></i>`,
    iconSize: [iconSize, iconSize],
    className: 'FontawesomeIcon'
  })
}

// Export a memoized version
export default memoize(
  opts => fontawesomeIcon(opts),
  opts => `fontawesome-icon-${opts.icon}-${opts.iconSize}-${opts.color}-${opts.bearing}`
)
