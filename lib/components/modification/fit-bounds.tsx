import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'
import MapControl from 'react-leaflet-control'

import {ExpandIcon} from 'lib/components/icons'
import IconButton from 'lib/components/icon-button'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'

const label = 'Fit map to modification extents'

export default function FitBounds({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.Modification
}) {
  const leaflet = useLeaflet()
  const bounds = useModificationBounds(bundle, modification)
  const [trigger, setTrigger] = useState(0)

  // Zoom to bounds on a trigger or bounds change
  useEffect(() => {
    if (trigger !== 0) {
      if (bounds) {
        leaflet.map.fitBounds(bounds)
      }
    }
  }, [bounds, leaflet, trigger])

  return bounds ? (
    <MapControl position='topleft'>
      <IconButton
        label={label}
        onClick={() => setTrigger(Date.now())}
        shadow='lg'
        size='md'
        variant='solid'
      >
        <ExpandIcon />
      </IconButton>
    </MapControl>
  ) : null
}
