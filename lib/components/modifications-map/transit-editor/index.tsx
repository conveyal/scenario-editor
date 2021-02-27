import {Button, Heading, Stack, useDisclosure, useToast} from '@chakra-ui/react'
import {DomEvent, LatLng, LeafletMouseEvent} from 'leaflet'
import {useCallback, useEffect, useState} from 'react'
import {Marker, Polyline, Popup, useLeaflet} from 'react-leaflet'

import {ADD_TRIP_PATTERN, MINIMUM_SNAP_STOP_ZOOM_LEVEL} from 'lib/constants'
import colors from 'lib/constants/colors'
import {DEFAULT_SEGMENT_SPEED} from 'lib/constants/timetables'
import useZoom from 'lib/hooks/use-leaflet-zoom'
import message from 'lib/message'
import getStopsFromSegments from 'lib/utils/get-stops'
import getNearestStopToPoint from 'lib/utils/get-stop-near-point'
import getLineString from 'lib/utils/get-line-string'
import createLogDomEvent from 'lib/utils/log-dom-event'
import {getSegmentCoordinates} from 'lib/utils/segment'

import {
  getControlPointIconForZoom,
  getNewStopIconForZoom,
  getSnappedStopIconForZoom
} from '../../map/circle-icons'
import Pane from '../../map/pane'

// Valid modification types for this component
type Modification = CL.AddTripPattern | CL.Reroute

type ControlPoint = L.LatLngLiteral & {
  index: number
}

type TransitEditorProps = {
  allowExtend: boolean
  allStops: GTFS.Stop[]
  extendFromEnd: boolean
  followRoad: boolean
  modification: Modification
  spacing: number
  updateModification: (update: Partial<Modification>) => void
}

// Keep track of zIndexes for all layers
let indexCounter = 600
const zIndex = {
  segments: 501,
  autoCreatedStops: indexCounter++,
  controlPoints: indexCounter++,
  stops: indexCounter++,
  newStop: indexCounter++
}

const logDomEvent = createLogDomEvent('transit-editor')

// Store the timestamp of the last event to prevent double map clicks
let lastEventMs = Date.now()
const MIN_EVENT_INTERVAL = 500

/**
 * Check if the Leaflet point goes over the anti-meridian.
 */
const latlngIsOutOfRange = (ll: L.LatLngLiteral) =>
  ll.lng >= 180 || ll.lng <= -180 || (ll.lat >= 90 && ll.lat <= -90)

const outOfRangeMessage = (ll: L.LatLngLiteral) =>
  `Selected coordinate ${
    (ll.lng, ll.lat)
  } (lon, lat) is invalid. Coordinates must not go over the anti-meridian.`

// We previously allowed segment speeds to get out of sync with the segments.
// This ensures consistent array lengths.
const extendSegmentSpeedsTo = (ss: number[], newLength: number): number[] => {
  const lastSpeed = ss[ss.length - 1] || DEFAULT_SEGMENT_SPEED
  for (let i = ss.length; i < newLength; i++) {
    ss.push(lastSpeed)
  }
  return ss
}

// Helper function to get the coordinates from a segment depending on type
const coordinatesFromSegment = (
  segment: CL.ModificationSegment,
  end = false
): GeoJSON.Position => {
  const coordinates = getSegmentCoordinates(segment)
  return end ? coordinates.slice(-1)[0] : coordinates[0]
}

function useNewStopIcon() {
  const zoom = useZoom()
  const [newStopIcon, setNewStopIcon] = useState(() =>
    getNewStopIconForZoom(zoom)
  )
  useEffect(() => {
    setNewStopIcon(getNewStopIconForZoom(zoom))
  }, [zoom])

  return newStopIcon
}

// Get the modification segments. Always return an array
const EMPTY_SEGMENTS = []
const getSegments = (m: Modification): CL.ModificationSegment[] => [
  ...(m.segments || EMPTY_SEGMENTS)
]

// Hook for getting the segments
function useSegments(modification: Modification) {
  return modification.segments || EMPTY_SEGMENTS
}

/**
 * Create/edit a new route
 */
export default function TransitEditor({
  allowExtend,
  allStops,
  extendFromEnd,
  followRoad,
  modification,
  spacing,
  updateModification
}: TransitEditorProps) {
  const leaflet = useLeaflet()
  const segments = useSegments(modification)
  const toast = useToast()
  const zoom = useZoom()

  const latlngIsInvalidCheck = useCallback(
    (latlng: L.LatLng): boolean => {
      if (latlngIsOutOfRange(latlng)) {
        toast({
          isClosable: true,
          description: outOfRangeMessage(latlng),
          position: 'top',
          status: 'error',
          title: 'Invalid coordinate'
        })
        return true
      }
      return false
    },
    [toast]
  )

  /**
   * Handles creating a new array so each usage below does not have to.
   */
  const updateSegments = useCallback(
    (newSegments: CL.ModificationSegment[]) => {
      updateModification({segments: [...newSegments]})
    },
    [updateModification]
  )

  const getStopNearPoint = useCallback(
    (point: L.LatLng) => {
      if (zoom >= MINIMUM_SNAP_STOP_ZOOM_LEVEL) {
        return getNearestStopToPoint(point, allStops, zoom)
      }
    },
    [allStops, zoom]
  )

  const handleMapClick = useCallback(
    async (event: L.LeafletMouseEvent) => {
      logDomEvent('Map.onClick', event)
      if (Date.now() - lastEventMs < MIN_EVENT_INTERVAL) {
        console.log('Map.onClick cancelled due to previous event')
        return
      }
      const {latlng} = event
      if (latlngIsInvalidCheck(latlng)) return
      if (!allowExtend) {
        toast({
          isClosable: true,
          title: 'Click ignored',
          description: 'Extending is disabled.',
          position: 'top',
          status: 'info'
        })
        return
      }

      // Add a new stop and update the segments
      updateModification(
        await addStop(
          latlng,
          modification,
          extendFromEnd,
          followRoad,
          spacing,
          getStopNearPoint(latlng)
        )
      )
    },
    [
      allowExtend,
      extendFromEnd,
      followRoad,
      getStopNearPoint,
      latlngIsInvalidCheck,
      modification,
      spacing,
      toast,
      updateModification
    ]
  )

  useEffect(() => {
    leaflet.map.on('click', handleMapClick)
    return () => leaflet.map.off('click', handleMapClick)
  }, [handleMapClick, leaflet])

  const insertStopAtIndex = useCallback(
    async (index: number, latlng: L.LatLng) => {
      lastEventMs = Date.now()

      if (latlngIsInvalidCheck(latlng)) return
      updateModification(
        await insertStop(
          latlng,
          index,
          modification,
          followRoad,
          getStopNearPoint(latlng)
        )
      )
    },
    [
      followRoad,
      latlngIsInvalidCheck,
      getStopNearPoint,
      modification,
      updateModification
    ]
  )

  const deleteStopOrPoint = useCallback(
    async (index) => {
      const newSegments = await deleteStopOrPointFromSegments(
        modification,
        index,
        followRoad
      )
      updateModification(newSegments)
    },
    [followRoad, modification, updateModification]
  )

  const _onStopDragEnd = useCallback(
    async (stopIndex: number, latlng: L.LatLng) => {
      lastEventMs = Date.now()

      if (latlngIsInvalidCheck(latlng)) return
      updateSegments(
        await onStopDragEnd(
          latlng,
          stopIndex,
          segments,
          followRoad,
          getStopNearPoint(latlng)
        )
      )
    },
    [
      followRoad,
      getStopNearPoint,
      latlngIsInvalidCheck,
      segments,
      updateSegments
    ]
  )

  const _onControlPointDragEnd = useCallback(
    async (stopIndex: number, latlng: L.LatLng) => {
      lastEventMs = Date.now()
      if (latlngIsInvalidCheck(latlng)) return

      updateSegments(
        await onControlPointDragEnd(latlng, stopIndex, segments, followRoad)
      )
    },
    [followRoad, latlngIsInvalidCheck, segments, updateSegments]
  )

  return (
    <>
      <Segments clickSegment={insertStopAtIndex} modification={modification} />
      <AutoCreatedStops onDragEnd={insertStopAtIndex} segments={segments} />
      <ControlPoints
        deletePoint={deleteStopOrPoint}
        onDragEnd={_onControlPointDragEnd}
        segments={segments}
        updateSegments={updateSegments}
      />
      <Stops
        deleteStop={deleteStopOrPoint}
        onStopDragEnd={_onStopDragEnd}
        segments={segments}
        updateSegments={updateSegments}
      />
    </>
  )
}

const getLineWeightForZoom = (z: number) => (z < 11 ? 1 : z - 9)
function useLineWeight() {
  const zoom = useZoom()
  const [lineWeight, setLineWeight] = useState(() => getLineWeightForZoom(zoom))
  useEffect(() => {
    setLineWeight(getLineWeightForZoom(zoom))
  }, [zoom])

  return lineWeight
}

function useSegmentFeatures(modification: Modification): L.LatLngLiteral[][] {
  const segments = useSegments(modification)
  const [segmentFeatures, setSegmentFeatures] = useState<L.LatLngLiteral[][]>(
    () => segments.map(getSegmentAsLatLngs)
  )
  useEffect(() => {
    setSegmentFeatures(segments.map(getSegmentAsLatLngs))
  }, [segments, setSegmentFeatures])
  return segmentFeatures
}

function Segments({clickSegment, modification}) {
  const lineWeight = useLineWeight()
  const segmentFeatures = useSegmentFeatures(modification)
  const showStop = useDisclosure()

  return (
    <>
      <Pane zIndex={zIndex.segments}>
        {segmentFeatures.map((feature, index) => (
          <Polyline
            bubblingMouseEvents={false}
            color={colors.ADDED}
            interactive
            key={index}
            onClick={(event: L.LeafletMouseEvent) => {
              logDomEvent('Segment.onClick', event)
              DomEvent.stop(event)
              clickSegment(index, event.latlng)
            }}
            onBlur={showStop.onClose}
            onFocus={showStop.onOpen}
            onMouseover={showStop.onOpen}
            onMouseout={showStop.onClose}
            positions={feature}
            weight={lineWeight}
          />
        ))}
      </Pane>
      <Pane zIndex={zIndex.newStop}>
        {showStop.isOpen && <NewStopUnderCursor />}
      </Pane>
    </>
  )
}

/**
 * Get the current cursor position as a Leaflet.LatLng
 */
function useCursorPosition() {
  const leaflet = useLeaflet()
  const [cursorPosition, setCursorPosition] = useState<LatLng | null>(null)

  useEffect(() => {
    const handleMouseMove = (event: LeafletMouseEvent) =>
      setCursorPosition(event.latlng)
    leaflet.map.on('mousemove', handleMouseMove)
    return () => {
      leaflet.map.off('mousemove', handleMouseMove)
    }
  }, [leaflet, setCursorPosition])

  return cursorPosition
}

/**
 * Show a new stop under the cursor when hovering over a segment.
 */
function NewStopUnderCursor() {
  const cursorPosition = useCursorPosition()
  const newStopIcon = useNewStopIcon()
  return cursorPosition != null ? (
    <Marker position={cursorPosition} icon={newStopIcon} interactive={false} />
  ) : null
}

function useStops(segments: CL.ModificationSegment[]) {
  const [stops, setStops] = useState<CL.StopFromSegment[]>(() =>
    getStopsFromSegments(segments)
  )
  useEffect(() => {
    setStops(getStopsFromSegments(segments))
  }, [segments])

  return stops
}

// Use array index here instead of overall index
const autoCreatedStopKey = (index: number) => `Auto-created Stop ${index + 1}`

function AutoCreatedStops({onDragEnd, segments}) {
  const newStopIcon = useNewStopIcon()
  const stops = useStops(segments)

  return (
    <Pane zIndex={zIndex.autoCreatedStops}>
      {stops
        .filter((s) => s.autoCreated)
        .map((stop, index) => (
          <Marker
            position={stop}
            draggable
            icon={newStopIcon}
            key={autoCreatedStopKey(index)}
            onClick={(event: L.LeafletMouseEvent) => {
              logDomEvent('AutoCreatedStop.onClick', event)
              DomEvent.stop(event)
              onDragEnd(stop.index, event.latlng)
            }}
            onDragend={(event: L.DragEndEvent) => {
              logDomEvent('AutoCreatedStop.onDragend', event)
              DomEvent.stop(event)
              onDragEnd(stop.index, (event.target as L.Marker).getLatLng())
            }}
            opacity={0.5}
            title={autoCreatedStopKey(index)}
          />
        ))}
    </Pane>
  )
}

function useNewSnappedStopIcon() {
  const zoom = useZoom()
  const [newSnappedStopIcon, setNewSnappedStopIcon] = useState(() =>
    getSnappedStopIconForZoom(zoom)
  )

  useEffect(() => {
    setNewSnappedStopIcon(getSnappedStopIconForZoom(zoom))
  }, [zoom])

  return newSnappedStopIcon
}

// Array index is used here because it refers to the nth Stop instead of overall index
const stopKey = (index: number) => `Stop ${index + 1}`

function Stops({deleteStop, onStopDragEnd, segments, updateSegments}) {
  const stops = useStops(segments)
  const newSnappedStopIcon = useNewSnappedStopIcon()
  const newStopIcon = useNewStopIcon()
  const zoom = useZoom()

  function toggleStop(stopIndex: number) {
    if (stopIndex < segments.length) {
      segments[stopIndex] = {
        ...segments[stopIndex],
        stopAtStart: false,
        fromStopId: null
      }
    }

    if (stopIndex > 0) {
      segments[stopIndex - 1] = {
        ...segments[stopIndex - 1],
        stopAtEnd: false,
        toStopId: null
      }
    }
    updateSegments(segments)
  }

  return (
    <Pane zIndex={zIndex.stops}>
      {stops
        .filter((s) => !s.autoCreated)
        .map((stop, index) => (
          <Marker
            position={stop}
            icon={stop.stopId ? newSnappedStopIcon : newStopIcon}
            draggable
            key={`${stopKey(index)} ${zoom} ${stop.lng},${stop.lat}`}
            title={stopKey(index)}
            ondragend={(event: L.DragEndEvent) => {
              logDomEvent('Stop.onDragEnd', event)
              DomEvent.stop(event)
              onStopDragEnd(stop.index, (event.target as L.Marker).getLatLng())
            }}
          >
            <Popup>
              <Stack>
                <Heading size='sm'>{stopKey(index)}</Heading>
                <Button
                  onClick={() => toggleStop(stop.index)}
                  colorScheme='blue'
                >
                  {message('transitEditor.makeControlPoint')}
                </Button>
                <Button
                  onClick={() => deleteStop(stop.index)}
                  colorScheme='red'
                >
                  {message('transitEditor.deletePoint')}
                </Button>
              </Stack>
            </Popup>
          </Marker>
        ))}
    </Pane>
  )
}

function useControlPoints(segments: CL.ModificationSegment[]) {
  const [controlPoints, setControlPoints] = useState(() =>
    getControlPointsForSegments(segments)
  )
  useEffect(() => {
    setControlPoints(getControlPointsForSegments(segments))
  }, [segments])
  return controlPoints
}

function useControlPointIcon() {
  const zoom = useZoom()
  const [controlPointIcon, setControlPointIcon] = useState(() =>
    getControlPointIconForZoom(zoom)
  )

  useEffect(() => {
    setControlPointIcon(getControlPointIconForZoom(zoom))
  }, [zoom])

  return controlPointIcon
}

type ControlPointsProps = {
  deletePoint: (index: number) => void
  onDragEnd: (index: number, latlng: LatLng) => void
  segments: CL.ModificationSegment[]
  updateSegments: (segments: CL.ModificationSegment[]) => void
}

const controlPointKey = (index: number) => `Control Point ${index + 1}`
function ControlPoints({
  deletePoint,
  onDragEnd,
  segments,
  updateSegments
}: ControlPointsProps) {
  const controlPoints = useControlPoints(segments)
  const controlPointIcon = useControlPointIcon()
  const zoom = useZoom()

  function togglePoint(pointIndex: number) {
    if (pointIndex < segments.length) {
      segments[pointIndex] = {
        ...segments[pointIndex],
        stopAtStart: true
      }
    }

    if (pointIndex > 0) {
      segments[pointIndex - 1] = {
        ...segments[pointIndex - 1],
        stopAtEnd: true
      }
    }

    updateSegments(segments)
  }

  return (
    <Pane zIndex={zIndex.controlPoints}>
      {controlPoints.map((cp, index) => (
        <Marker
          position={cp}
          draggable
          icon={controlPointIcon}
          key={`${controlPointKey(index)} ${zoom} ${cp.lng} ${cp.lat}`}
          onDragend={(event: L.DragEndEvent) => {
            logDomEvent('ControlPoint.onDragend', event)
            DomEvent.stop(event)
            onDragEnd(cp.index, (event.target as L.Marker).getLatLng())
          }}
          title={controlPointKey(index)}
        >
          <Popup>
            <Stack>
              <Heading size='sm'>{controlPointKey(index)}</Heading>
              <Button onClick={() => togglePoint(cp.index)} colorScheme='blue'>
                {message('transitEditor.makeStop')}
              </Button>
              <Button onClick={() => deletePoint(cp.index)} colorScheme='red'>
                {message('transitEditor.deletePoint')}
              </Button>
            </Stack>
          </Popup>
        </Marker>
      ))}
    </Pane>
  )
}

/**
 * Handle a user clicking on the map
 */
async function addStop(
  latlng: LatLng,
  modification: Modification,
  extendFromEnd: boolean,
  followRoad: boolean,
  spacing: number,
  snapStop: null | GTFS.Stop
): Promise<Partial<Modification>> {
  const segments = getSegments(modification)

  const coordinates: GeoJSON.Position = snapStop
    ? [snapStop.stop_lon, snapStop.stop_lat]
    : [latlng.lng, latlng.lat]
  const stopId: void | string = snapStop?.stop_id

  let newSegments: CL.ModificationSegment[]
  if (segments.length > 0) {
    if (extendFromEnd) {
      // Insert a segment at the end
      const lastSegment = segments[segments.length - 1]
      const from = coordinatesFromSegment(lastSegment, true)
      const geometry = await getLineString(from, coordinates, {
        followRoad
      })

      newSegments = [
        ...segments,
        {
          fromStopId: lastSegment.toStopId,
          geometry,
          spacing,
          stopAtEnd: true,
          stopAtStart: lastSegment.stopAtEnd,
          toStopId: stopId
        }
      ]
    } else {
      const firstSegment = segments[0]
      const to = coordinatesFromSegment(firstSegment)
      const geometry = await getLineString(coordinates, to, {followRoad})

      newSegments = [
        {
          fromStopId: stopId,
          geometry,
          spacing,
          stopAtEnd: firstSegment.stopAtStart,
          stopAtStart: true,
          toStopId: firstSegment.fromStopId
        },
        ...segments
      ]
    }

    // Remove all leftover point features
    newSegments = newSegments.filter((s) => s.geometry.type !== 'Point')
  } else {
    newSegments = [
      {
        fromStopId: stopId,
        geometry: {type: 'Point', coordinates},
        spacing,
        stopAtEnd: true,
        stopAtStart: true,
        toStopId: stopId
      }
    ]
  }

  // Update the segment speeds
  const updateSegmentSpeeds = (ss: CL.SegmentSpeeds) => {
    if (!extendFromEnd) {
      ss.unshift(ss[0] || DEFAULT_SEGMENT_SPEED)
    }

    return extendSegmentSpeedsTo(ss, newSegments.length)
  }

  if (modification.type === ADD_TRIP_PATTERN) {
    return {
      segments: newSegments,
      timetables: modification.timetables.map((tt) => ({
        ...tt,
        segmentSpeeds: updateSegmentSpeeds([...tt.segmentSpeeds])
      }))
    }
  } else {
    // type === REROUTE
    return {
      segments: newSegments,
      segmentSpeeds: updateSegmentSpeeds([...modification.segmentSpeeds])
    }
  }
}

/**
 * When an existing stop is dragged, reflow the segments around it. If an existing stop is close by
 * snap to that stop.
 */
async function onStopDragEnd(
  latlng: LatLng,
  stopIndex: number,
  segments: CL.ModificationSegment[],
  followRoad: boolean,
  snapStop: null | GTFS.Stop
): Promise<CL.ModificationSegment[]> {
  const coordinates = snapStop
    ? [snapStop.stop_lon, snapStop.stop_lat]
    : [latlng.lng, latlng.lat]
  const newStopId = snapStop?.stop_id

  const isEnd = stopIndex === segments.length
  const isStart = stopIndex === 0

  const newSegments = [...segments]

  if (!isStart) {
    const previousSegment = segments[stopIndex - 1]
    const geometry = await getLineString(
      coordinatesFromSegment(previousSegment),
      coordinates,
      {followRoad}
    )
    // Overwrite geometry and preserve other attributes
    newSegments[stopIndex - 1] = {
      ...previousSegment,
      toStopId: newStopId,
      geometry
    }
  }

  if (!isEnd) {
    const nextSegment = segments[stopIndex]
    newSegments[stopIndex] = {
      ...nextSegment,
      fromStopId: newStopId,
      geometry: await getLineString(
        coordinates,
        coordinatesFromSegment(nextSegment, true),
        {followRoad}
      )
    }
  }

  return newSegments
}

/**
 * When a control point is dragged, reflow the segments around it.
 */
async function onControlPointDragEnd(
  latlng: LatLng,
  controlPointIndex: number,
  segments: CL.ModificationSegment[],
  followRoad: boolean
): Promise<CL.ModificationSegment[]> {
  const isEnd = controlPointIndex === segments.length
  const isStart = controlPointIndex === 0
  const coordinates = [latlng.lng, latlng.lat]

  const newSegments = [...segments]
  if (!isStart) {
    const previousSegment = newSegments[controlPointIndex - 1]
    // Overwrite geometry and preserve other attributes
    newSegments[controlPointIndex - 1] = {
      ...previousSegment,
      geometry: await getLineString(
        coordinatesFromSegment(previousSegment),
        coordinates,
        {followRoad}
      )
    }
  }

  if (!isEnd) {
    const nextSegment = newSegments[controlPointIndex]
    // Can be a point if only one stop has been created
    const toCoordinates = coordinatesFromSegment(nextSegment, true)
    newSegments[controlPointIndex] = {
      ...nextSegment,
      geometry: await getLineString(coordinates, toCoordinates, {
        followRoad
      })
    }
  }

  return newSegments
}

/**
 * Delete stop or point and create new segments and segment speeds. Return the new modification
 * values ready to send as an update.
 */
async function deleteStopOrPointFromSegments(
  modification: Modification,
  index: number,
  followRoad: boolean
): Promise<Partial<Modification>> {
  let segments = getSegments(modification)
  const newSegmentsLength = segments.length - 1

  if (index === 0) {
    segments = segments.slice(1)

    // Update segment speeds
    const removeFirstSegmentSpeed = (ss: CL.SegmentSpeeds) =>
      extendSegmentSpeedsTo(ss.slice(1), newSegmentsLength)

    if (modification.type === ADD_TRIP_PATTERN) {
      return {
        segments,
        timetables: modification.timetables.map((tt) => ({
          ...tt,
          segmentSpeeds: removeFirstSegmentSpeed([...tt.segmentSpeeds])
        }))
      }
    } else {
      // type === REROUTE
      return {
        segments,
        segmentSpeeds: removeFirstSegmentSpeed([...modification.segmentSpeeds])
      }
    }
  } else if (index === segments.length) {
    // nb stop index not hop index
    segments.pop()

    // Update segment speeds
    const removeLastSegmentSpeed = (ss) => {
      if (ss.length === segments.length) {
        return ss.slice(0, -1)
      } else {
        return extendSegmentSpeedsTo(ss, newSegmentsLength)
      }
    }

    if (modification.type === ADD_TRIP_PATTERN) {
      return {
        segments,
        timetables: modification.timetables.map((tt) => ({
          ...tt,
          segmentSpeeds: removeLastSegmentSpeed(tt.segmentSpeeds)
        }))
      }
    } else {
      // type === REROUTE
      return {
        segments,
        segmentSpeeds: removeLastSegmentSpeed(modification.segmentSpeeds)
      }
    }
  } else {
    // If we cut the segment we need to create two line strings
    const seg0 = segments[index - 1]
    const seg1 = segments[index]
    const line = await getLineString(
      coordinatesFromSegment(seg0),
      coordinatesFromSegment(seg1, true),
      {followRoad}
    )

    segments.splice(index - 1, 2, {
      fromStopId: seg0.fromStopId,
      geometry: line,
      spacing: seg0.spacing,
      stopAtEnd: seg1.stopAtEnd,
      stopAtStart: seg0.stopAtStart,
      toStopId: seg1.toStopId
    })

    // Splice out a segment speed
    const spliceSegmentSpeed = (ss) => {
      if (ss.length > index) {
        ss.splice(index, 1)
      }

      return extendSegmentSpeedsTo(ss, newSegmentsLength)
    }

    if (modification.type === ADD_TRIP_PATTERN) {
      return {
        segments,
        timetables: modification.timetables.map((tt) => ({
          ...tt,
          segmentSpeeds: spliceSegmentSpeed(tt.segmentSpeeds)
        }))
      }
    } else {
      // type === REROUTE
      return {
        segments,
        segmentSpeeds: spliceSegmentSpeed(modification.segmentSpeeds)
      }
    }
  }
}

/**
 * Insert a stop at the specified position.
 */
async function insertStop(
  latlng: LatLng,
  index: number,
  modification: Modification,
  followRoad: boolean,
  snapStop: null | GTFS.Stop
): Promise<Partial<Modification>> {
  const coordinates = snapStop
    ? [snapStop.stop_lon, snapStop.stop_lat]
    : [latlng.lng, latlng.lat]
  const stopId = snapStop?.stop_id

  const segments = getSegments(modification)
  const sourceSegment = segments[index]
  const line0 = await getLineString(
    coordinatesFromSegment(sourceSegment),
    coordinates,
    {followRoad}
  )
  const line1 = await getLineString(
    coordinates,
    coordinatesFromSegment(sourceSegment, true),
    {followRoad}
  )

  const newSegments: CL.ModificationSegment[] = [
    ...segments.slice(0, index),
    {
      fromStopId: sourceSegment.fromStopId,
      geometry: line0,
      spacing: sourceSegment.spacing,
      stopAtEnd: true,
      stopAtStart: sourceSegment.stopAtStart,
      toStopId: stopId
    },
    {
      fromStopId: stopId,
      geometry: line1,
      spacing: sourceSegment.spacing,
      stopAtEnd: sourceSegment.stopAtEnd,
      stopAtStart: true,
      toStopId: sourceSegment.toStopId
    },
    ...segments.slice(index + 1)
  ]

  // Determine new segment speeds
  const insertSpeed = (ss) => {
    if (ss.length > index) {
      const duplicateSpeed = ss[index]
      ss.splice(index + 1, 0, duplicateSpeed)
    }

    return extendSegmentSpeedsTo(ss, newSegments.length)
  }

  if (modification.type === ADD_TRIP_PATTERN) {
    return {
      segments: newSegments,
      timetables: modification.timetables.map((tt) => ({
        ...tt,
        segmentSpeeds: insertSpeed(tt.segmentSpeeds)
      }))
    }
  } else {
    // type === REROUTE
    return {
      segments: newSegments,
      segmentSpeeds: insertSpeed(modification.segmentSpeeds)
    }
  }
}

/**
 * Get the coordinates
 */
function getSegmentAsLatLngs(
  segment: CL.ModificationSegment
): L.LatLngLiteral[] {
  return getSegmentCoordinates(segment).map((p) => ({
    lat: p[1],
    lng: p[0]
  }))
}

function getControlPointsForSegments(
  segments: CL.ModificationSegment[]
): ControlPoint[] {
  const controlPoints: ControlPoint[] = []
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].stopAtStart) {
      const c = coordinatesFromSegment(segments[i])
      controlPoints.push({
        lat: c[1],
        lng: c[0],
        index: i
      })
    }

    if (i === segments.length - 1 && !segments[i].stopAtEnd) {
      const c = coordinatesFromSegment(segments[i], true)
      controlPoints.push({
        lat: c[1],
        lng: c[0],
        index: i + 1
      })
    }
  }
  return controlPoints
}
