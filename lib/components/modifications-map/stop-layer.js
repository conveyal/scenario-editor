import {useDisclosure} from '@chakra-ui/react'
import React, {memo} from 'react'
import {CircleMarker, Tooltip} from 'react-leaflet'

import Pane from '../map/pane'

const STOP_RADIUS = 4

export default function StopLayer(p) {
  const routeStops = React.useMemo(
    () => getUniqueStops(p.feed, p.modification),
    [p.feed, p.modification]
  )

  const showUnselected = !!p.unselectedColor

  const isSelected = (s) =>
    p.modification.stops == null
      ? p.nullIsWildcard
      : p.modification.stops.includes(s.stop_id)

  return (
    <Pane zIndex={503}>
      {showUnselected &&
        routeStops
          .filter((s) => !isSelected(s))
          .map((s) => (
            <StopMarker
              color={p.unselectedColor}
              key={s.stop_id}
              onSelect={p.onSelect}
              stop={s}
            />
          ))}
      {routeStops.filter(isSelected).map((s) => (
        <StopMarker
          color={p.selectedColor}
          key={s.stop_id}
          onSelect={p.onSelect}
          stop={s}
        />
      ))}
    </Pane>
  )
}

const StopMarker = memo(({color, onSelect, stop}) => {
  const tooltip = useDisclosure()
  const center = [stop.stop_lat, stop.stop_lon]
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
        key={stop.stop_id + tooltip.isOpen}
        opacity={tooltip.isOpen ? 1 : 0}
        permanent
      >
        <span data-id={stop.stop_id} data-coordinate={center.join(',')}>
          {stop.stop_name}
        </span>
      </Tooltip>
    </CircleMarker>
  )
})

function getUniqueStops(feed, modification) {
  if (!feed || modification.routes == null) return []
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])
  if (!route || !route.patterns) return []
  let patterns = route.patterns

  if (modification.trips !== null) {
    patterns = patterns.filter((p) =>
      p.trips.find((t) => modification.trips.includes(t.trip_id))
    )
  }

  return getUniqueStopsForPatterns({
    patterns,
    stopsById: feed.stopsById
  })
}

function getUniqueStopsForPatterns({patterns, stopsById}) {
  const routeStopIds = new Set()
  patterns.forEach((p) => {
    p.stops.forEach((s) => routeStopIds.add(s.stop_id))
  })
  const stops = []
  routeStopIds.forEach((sid) => stops.push(stopsById[sid]))
  return stops
}
