import {Button} from '@chakra-ui/core'
import {faExpand} from '@fortawesome/free-solid-svg-icons'
import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'
import {useSelector} from 'react-redux'

import selectModificationBounds from 'lib/selectors/modification-bounds'

import Icon from '../icon'
import Tip from '../tip'

const label = 'Fit map to modification extents'

export default function FitBounds() {
  const leaflet = useLeaflet()
  const bounds = useSelector(selectModificationBounds)
  const [fitBoundsTriggered, setFitBoundsTriggered] = useState(0)

  // Zoom to bounds on a trigger or bounds change
  useEffect(() => {
    if (fitBoundsTriggered !== 0) {
      if (bounds) {
        leaflet.map.fitBounds(bounds)
      }
    }
  }, [bounds, leaflet, fitBoundsTriggered])

  return (
    <Tip label={label}>
      <Button
        aria-label={label}
        onClick={() => setFitBoundsTriggered(Date.now())}
        size='sm'
        variant='ghost'
        variantColor='blue'
      >
        <Icon icon={faExpand} fixedWidth={false} />
      </Button>
    </Tip>
  )
}
