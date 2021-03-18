import {useEffect, useState} from 'react'
import {Polyline} from 'react-leaflet'

import Marker from 'lib/components/map/marker'
import {NEW_LINE_WEIGHT} from 'lib/constants'
import colors from 'lib/constants/colors'
import useLeafletZoom from 'lib/hooks/use-leaflet-zoom'
import getStops from 'lib/utils/get-stops'
import {getSegmentCoordinates} from 'lib/utils/segment'

import {
  getNewStopIconForZoom,
  getSnappedStopIconForZoom
} from '../map/circle-icons'
import DirectionalMarkers from '../directional-markers'

function getIconsForZoom(z) {
  return {
    newStop: getNewStopIconForZoom(z),
    newSnappedStop: getSnappedStopIconForZoom(z)
  }
}

function useIcons() {
  const zoom = useLeafletZoom()
  const [icons, setIcons] = useState(() => getIconsForZoom(zoom))

  useEffect(() => {
    setIcons(getIconsForZoom(zoom))
  }, [zoom])

  return icons
}

function parseSegments(segments: CL.ModificationSegment[]) {
  const coordinates = segments.map(getSegmentCoordinates).flat()
  return {
    lineStrings: [
      {
        geometry: {
          coordinates: coordinates,
          type: 'LineString'
        } as GeoJSON.LineString
      }
    ],
    leafletLatLngs: coordinates.map((c) => ({lat: c[1], lng: c[0]})),
    stops: getStops(segments)
  }
}

function useParsedSegments(segments) {
  const [values, setValues] = useState(() => parseSegments(segments))
  useEffect(() => {
    setValues(parseSegments(segments))
  }, [segments])
  return values
}

type AddTripPatternLayerProps = {
  bidirectional: boolean
  dim?: boolean
  segments: CL.ModificationSegment[]
}

/**
 * A layer to display (not edit) an added trip pattern
 */
export default function AddTripPatternLayer({
  bidirectional,
  dim = false,
  segments
}: AddTripPatternLayerProps) {
  const icons = useIcons()
  const values = useParsedSegments(segments)

  return (
    <>
      <Polyline
        color={colors.ADDED}
        opacity={dim ? 0.5 : 1}
        positions={values.leafletLatLngs}
        weight={NEW_LINE_WEIGHT}
      />
      {!bidirectional && !dim && (
        <DirectionalMarkers
          color={colors.ADDED}
          patterns={values.lineStrings}
        />
      )}
      {values.stops.map((s, i) => (
        <Marker
          icon={s.stopId ? icons.newSnappedStop : icons.newStop}
          key={`stop-${i}`}
          opacity={dim ? 0.5 : 1}
          position={s}
        />
      ))}
    </>
  )
}
