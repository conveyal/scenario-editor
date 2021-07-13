import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useMemo} from 'react'

import colors from 'lib/constants/colors'
import {useRoutePatterns, useRouteStops} from 'lib/gtfs/hooks'

import Pane from '../map/pane'

const DirectionalMarkers = dynamic(() => import('../directional-markers'))
const GeoJSON = dynamic(() => import('../map/geojson'))
const PatternGeometry = dynamic(() => import('../map/geojson-patterns'))

const LINE_WEIGHT = 3

const hasLineString = (m) =>
  get(m, 'segments[0].geometry.type') === 'LineString'

/**
 * A layer showing a reroute modification
 */
export default function RerouteLayer({
  dim = false,
  bundleId,
  isEditing = false,
  modification
}: {
  dim?: boolean
  bundleId: string
  isEditing?: boolean
  modification: CL.Reroute
}) {
  const routeId = get(modification, 'routes[0]')
  const patterns = useRoutePatterns(bundleId, modification.feed, routeId)
  const stops = useRouteStops(bundleId, modification.feed, routeId)
  const opacity = dim ? 0.5 : 1
  const addedSegments = useMemo(() => {
    return getAddedSegments(modification)
  }, [modification])
  const removedSegments = useMemo(() => {
    if (stops && patterns)
      return getRemovedSegments(stops, modification, patterns)
  }, [stops, modification, patterns])

  return (
    <>
      <Pane zIndex={500}>
        <PatternGeometry color={colors.NEUTRAL_LIGHT} patterns={patterns} />
        <DirectionalMarkers color={colors.NEUTRAL_LIGHT} patterns={patterns} />
      </Pane>
      {!isEditing && hasLineString(modification) && (
        <Pane zIndex={501}>
          <GeoJSON
            data={removedSegments}
            color={colors.REMOVED}
            opacity={opacity}
            weight={LINE_WEIGHT}
          />
          <GeoJSON
            data={addedSegments}
            color={colors.ADDED}
            opacity={opacity}
            weight={LINE_WEIGHT}
          />
        </Pane>
      )}
    </>
  )
}

// Convert added segments into GeoJSON
function getAddedSegments(modification: CL.Reroute): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: modification.segments.map((segment) => {
      return {
        type: 'Feature',
        geometry: segment.geometry,
        properties: {}
      }
    })
  }
}

function getRemovedSegments(
  stops: GTFS.Stop[],
  modification: CL.Reroute,
  patterns: GTFS.Pattern[]
): GeoJSON.FeatureCollection {
  const removedSegments = (patterns || [])
    .map((pattern) => {
      // make sure the modification applies to this pattern. If the modification
      // doesn't have a start or end stop, just use the first/last stop as this is
      // just for display and we can't highlight past the stops anyhow
      const fromStopIndex =
        modification.fromStop != null
          ? pattern.orderedStopIds.findIndex((s) => s === modification.fromStop)
          : 0
      // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
      const toStopIndex =
        modification.toStop != null
          ? pattern.orderedStopIds.findIndex(
              (s, i) => i > fromStopIndex && s === modification.toStop
            )
          : pattern.orderedStopIds.length - 1

      const modificationAppliesToThisPattern =
        fromStopIndex !== -1 && toStopIndex !== -1
      if (modificationAppliesToThisPattern) {
        // NB using indices here so we get an object even if fromStop or toStop
        // is null stops in pattern are in fact objects but they only have stop ID.
        const fromStop = stops.find(
          (s) => s.id === pattern.orderedStopIds[fromStopIndex]
        )
        const toStop = stops.find(
          (s) => s.id === pattern.orderedStopIds[toStopIndex]
        )

        return lineSlice(
          point([fromStop.lon, fromStop.lat]),
          point([toStop.lon, toStop.lat]),
          {
            type: 'Feature',
            geometry: pattern.geometry,
            properties: {}
          }
        )
      }
    })
    .filter((segment) => !!segment)

  return {
    type: 'FeatureCollection',
    features: removedSegments
  }
}
