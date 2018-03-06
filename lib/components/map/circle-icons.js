// @flow
import Leaflet from 'leaflet'
import memoize from 'lodash/memoize'

import getStopRadius from '../../utils/get-stop-radius'

export const getControlPointIconForZoom = createGetCircleIconForZoom('controlPoint')
export const getNewStopIconForZoom = createGetCircleIconForZoom('newStop')
export const getSnappedStopIconForZoom = createGetCircleIconForZoom('newSnappedStop')

/**
 * Take an HTML string for a DivIcon and return a memoized function to generate
 * a DivIcon based on the current zoom level.
 */
function createGetCircleIconForZoom (type: string) {
  const className = `CircleIconMarker ${type}`
  return memoize((zoom: number) => {
    const radius = getStopRadius(zoom)
    const divIconOpts = {
      iconAnchor: undefined,
      iconSize: [radius * 2, radius * 2],
      className,
      html: '<div className="innerMarker"></div>'
    }

    /* Awful hack for incorrect offsets at small icon sizes
    if (radius < 3) {
      divIconOpts.iconAnchor = [radius * 2, radius * 2 + 7]
    } else if (radius < 5) {
      divIconOpts.iconAnchor = [radius * 2, radius * 2 + 1]
    } else if (radius < 8) {
      divIconOpts.iconAnchor = [radius, radius + 1]
    } */

    return Leaflet.divIcon(divIconOpts)
  })
}

/**
 * Enlarge an icon
 */
export function enlargeIconBy (icon: Leaflet.DivIcon, factor: number) {
  const iconSize = icon.options.iconSize

  return Leaflet.divIcon({
    ...icon.options,
    iconSize: [iconSize[0] * factor, iconSize[1] * factor]
  })
}
