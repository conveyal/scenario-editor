import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import React from 'react'

import colors from 'lib/constants/colors'
import useModificationPatterns from 'lib/hooks/use-modification-patterns'

import Pane from '../map/pane'

const DirectionalMarkers = dynamic(() => import('../directional-markers'))
const GeoJSON = dynamic(() => import('../map/geojson'))
const PatternGeometry = dynamic(() => import('../map/geojson-patterns'))

const LINE_WEIGHT = 3

/**
 * A layer showing a reroute modification
 */
export default function RerouteLayer({
  dim = false,
  feed,
  isEditing,
  modification
}) {
  // dim, feed, modification
  const patterns = useModificationPatterns({dim, feed, modification})
  if (!patterns || !feed) return null
  return (
    <>
      <Pane zIndex={500}>
        <PatternGeometry
          color={colors.NEUTRAL_LIGHT}
          dim={dim}
          patterns={patterns}
        />
        <DirectionalMarkers
          color={colors.NEUTRAL_LIGHT}
          dim={dim}
          patterns={patterns}
        />
      </Pane>
      {!isEditing &&
        get(modification, 'segments[0].geometry.type') === 'LineString' && (
          <Pane zIndex={501}>
            <GeoJSON
              data={getRemovedSegments(feed, modification, patterns)}
              color={colors.REMOVED}
              opacity={dim ? 0.5 : 1}
              weight={LINE_WEIGHT}
            />
            <GeoJSON
              data={getAddedSegments(modification)}
              color={colors.ADDED}
              opacity={dim ? 0.5 : 1}
              weight={LINE_WEIGHT}
            />
          </Pane>
        )}
    </>
  )
}

// Convert added segments into GeoJSON
function getAddedSegments(modification) {
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

function getRemovedSegments(feed, modification, patterns) {
  const removedSegments = (patterns || [])
    .map((pattern) => {
      // make sure the modification applies to this pattern. If the modification
      // doesn't have a start or end stop, just use the first/last stop as this is
      // just for display and we can't highlight past the stops anyhow
      const fromStopIndex =
        modification.fromStop != null
          ? pattern.stops.findIndex((s) => s.stop_id === modification.fromStop)
          : 0
      // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
      const toStopIndex =
        modification.toStop != null
          ? pattern.stops.findIndex(
              (s, i) => i > fromStopIndex && s.stop_id === modification.toStop
            )
          : pattern.stops.length - 1

      const modificationAppliesToThisPattern =
        fromStopIndex !== -1 && toStopIndex !== -1
      if (modificationAppliesToThisPattern) {
        // NB using indices here so we get an object even if fromStop or toStop
        // is null stops in pattern are in fact objects but they only have stop ID.
        const fromStop = feed.stopsById[pattern.stops[fromStopIndex].stop_id]
        const toStop = feed.stopsById[pattern.stops[toStopIndex].stop_id]

        return lineSlice(
          point([fromStop.stop_lon, fromStop.stop_lat]),
          point([toStop.stop_lon, toStop.stop_lat]),
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
