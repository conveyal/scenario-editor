import {DivIconOptions} from 'leaflet'
import memoize from 'lodash/memoize'

import Leaflet from 'lib/leaflet'
import getStopRadius from 'lib/utils/get-stop-radius'

export const getControlPointIconForZoom = createGetCircleIconForZoom(
  'controlPoint'
)
export const getNewStopIconForZoom = createGetCircleIconForZoom('newStop')
export const getSnappedStopIconForZoom = createGetCircleIconForZoom(
  'newSnappedStop'
)

/**
 * Take an HTML string for a DivIcon and return a memoized function to generate
 * a DivIcon based on the current zoom level.
 */
function createGetCircleIconForZoom(type) {
  const className = `CircleIconMarker ${type}`
  return memoize((zoom) => {
    const radius = getStopRadius(zoom)
    const divIconOpts: DivIconOptions = {
      iconAnchor: undefined,
      iconSize: [radius * 2, radius * 2],
      className,
      html: '<div className="innerMarker"></div>'
    }

    return Leaflet.divIcon(divIconOpts)
  })
}

/**
 * Enlarge an icon
 */
export function enlargeIconBy(icon, factor) {
  const iconSize = icon.options.iconSize

  return Leaflet.divIcon({
    ...icon.options,
    iconSize: [iconSize[0] * factor, iconSize[1] * factor]
  })
}
