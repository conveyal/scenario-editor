import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'
import {useSelector} from 'react-redux'

import selectModificationBounds from 'lib/selectors/modification-bounds'

import {ExpandIcon} from '../icons'
import IconButton from '../icon-button'

const label = 'Fit map to modification extents'

export default function FitBounds() {
  const leaflet = useLeaflet()
  const bounds = useSelector(selectModificationBounds)
  const [trigger, setTrigger] = useState(0)

  // Zoom to bounds on a trigger or bounds change
  useEffect(() => {
    if (trigger !== 0) {
      if (bounds) {
        leaflet.map.fitBounds(bounds)
      }
    }
  }, [bounds, leaflet, trigger])

  return (
    <IconButton label={label} onClick={() => setTrigger(Date.now())}>
      <ExpandIcon />
    </IconButton>
  )
}
