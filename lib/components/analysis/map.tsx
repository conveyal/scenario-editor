import lonlat from '@conveyal/lonlat'
import {Tooltip, useLeaflet} from 'react-leaflet'

import Marker from 'lib/components/map/marker'
import useOnMount from 'lib/hooks/use-on-mount'

/**
 * Handle map clicks and moving the marker.
 */
export default function AnalysisMap({
  isDisabled,
  markerPosition,
  markerTooltip,
  setOrigin
}) {
  const leaflet = useLeaflet()

  // Set the center point on initial load
  useOnMount(() => {
    if (markerPosition) {
      if (!leaflet.map.getBounds().contains(markerPosition)) {
        leaflet.map.panTo(markerPosition)
      }
    }
  })

  return (
    <Marker
      draggable={!isDisabled}
      opacity={isDisabled ? 0.5 : 1.0}
      onDragEnd={(e) => setOrigin(lonlat(e.target.getLatLng()))}
      position={markerPosition}
    >
      {markerTooltip && (
        <Tooltip permanent>
          <span>{markerTooltip}</span>
        </Tooltip>
      )}
    </Marker>
  )
}
