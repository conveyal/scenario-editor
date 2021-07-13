import {useDisclosure} from '@chakra-ui/react'
import get from 'lodash/get'
import {memo} from 'react'
import {CircleMarker, Tooltip} from 'react-leaflet'

import useRouteStops from 'lib/gtfs/hooks/use-route-stops'

import Pane from '../map/pane'

const STOP_RADIUS = 4

export default function StopLayer({
  bundleId,
  modification,
  nullIsWildcard = false,
  onSelect,
  selectedColor,
  unselectedColor
}: {
  bundleId: string
  modification: CL.StopModification | CL.Reroute
  nullIsWildcard?: boolean
  onSelect?: (stop: GTFS.Stop) => void
  selectedColor?: string
  unselectedColor?: string
}) {
  const routeStops = useRouteStops(
    bundleId,
    modification.feed,
    get(modification, 'routes[0]')
  )

  const showUnselected = !!unselectedColor

  const isSelected = (s: GTFS.Stop) =>
    get(modification, 'stops') != null
      ? get(modification, 'stops').includes(s.id)
      : nullIsWildcard

  return (
    <Pane zIndex={503}>
      {showUnselected &&
        routeStops
          .filter((s) => !isSelected(s))
          .map((s) => (
            <StopMarker
              color={unselectedColor}
              key={s.id}
              onSelect={onSelect}
              stop={s}
            />
          ))}
      {routeStops.filter(isSelected).map((s) => (
        <StopMarker
          color={selectedColor}
          key={s.id}
          onSelect={onSelect}
          stop={s}
        />
      ))}
    </Pane>
  )
}

const StopMarker = memo<{
  color: string
  onSelect: (stop: GTFS.Stop) => void
  stop: GTFS.Stop
}>(({color, onSelect, stop}) => {
  const tooltip = useDisclosure()
  const center: L.LatLngExpression = [stop.lat, stop.lon]
  return (
    <CircleMarker
      center={center}
      color={color}
      onClick={() => onSelect && onSelect(stop)}
      onMouseover={tooltip.onOpen}
      onMouseout={tooltip.onClose}
      radius={STOP_RADIUS}
    >
      <Tooltip
        key={stop.id + tooltip.isOpen}
        opacity={tooltip.isOpen ? 1 : 0}
        permanent
      >
        <span data-id={stop.id} data-coordinate={center.join(',')}>
          {stop.name}
        </span>
      </Tooltip>
    </CircleMarker>
  )
})
