import dynamic from 'next/dynamic'
import React from 'react'
import {GeoJSON} from 'react-leaflet'

import * as C from 'lib/constants'
import colors from 'lib/constants/colors'

const AddTripPatternLayer = dynamic(() => import('./add-trip-pattern-layer'))
const AdjustSpeedLayer = dynamic(() => import('./adjust-speed-layer'))
const PatternLayer = dynamic(() => import('./pattern-layer'))
const RerouteLayer = dynamic(() => import('./reroute-layer'))
const StopLayer = dynamic(() => import('./stop-layer'))

export default function Display(p: {
  bundle: CL.Bundle
  dim?: boolean
  modification: CL.Modification
}) {
  const m = p.modification
  switch (m.type) {
    case C.ADD_STREETS: {
      const feature: GeoJSON.MultiLineString = {
        type: 'MultiLineString',
        coordinates: m.lineStrings
      }
      return (
        <GeoJSON
          data={feature}
          style={{
            color: colors.ADDED,
            opacity: p.dim ? 0.5 : 1,
            weight: C.NEW_LINE_WEIGHT
          }}
        />
      )
    }
    case C.MODIFY_STREETS: {
      const geometryCollection: GeoJSON.GeometryCollection = {
        type: 'GeometryCollection',
        geometries: m.polygons.map((p) => ({
          type: 'Polygon',
          coordinates: [p]
        }))
      }
      return (
        <GeoJSON
          data={geometryCollection}
          style={{
            color: colors.MODIFIED,
            opacity: p.dim ? 0.5 : 1
          }}
        />
      )
    }
    case C.REMOVE_TRIPS:
      return (
        <PatternLayer
          color={colors.REMOVED}
          dim={p.dim}
          bundleId={p.bundle._id}
          modification={m as CL.RemoveTrips}
        />
      )
    case C.CONVERT_TO_FREQUENCY:
      return (
        <PatternLayer
          color={colors.MODIFIED}
          dim={p.dim}
          bundleId={p.bundle._id}
          modification={m as CL.ConvertToFrequency}
        />
      )
    case C.REMOVE_STOPS:
      return (
        <>
          <PatternLayer
            color={colors.NEUTRAL_LIGHT}
            dim={p.dim}
            bundleId={p.bundle._id}
            modification={m as CL.RemoveStops}
          />
          <StopLayer
            bundleId={p.bundle._id}
            modification={m as CL.RemoveStops}
            selectedColor={colors.REMOVED}
            unselectedColor={colors.NEUTRAL_LIGHT}
          />
        </>
      )
    case C.ADJUST_DWELL_TIME:
      return (
        <>
          <PatternLayer
            color={colors.NEUTRAL_LIGHT}
            dim={p.dim}
            bundleId={p.bundle._id}
            modification={m as CL.AdjustDwellTime}
          />
          <StopLayer
            bundleId={p.bundle._id}
            modification={m as CL.AdjustDwellTime}
            nullIsWildcard
            selectedColor={colors.MODIFIED}
          />
        </>
      )
    case C.ADJUST_SPEED:
      return <AdjustSpeedLayer dim={p.dim} bundle={p.bundle} modification={m} />
    case C.REROUTE:
      return (
        <RerouteLayer
          dim={p.dim}
          bundleId={p.bundle._id}
          modification={m as CL.Reroute}
        />
      )
    case C.ADD_TRIP_PATTERN:
      return (
        <AddTripPatternLayer
          dim={p.dim}
          bidirectional={(m as CL.AddTripPattern).bidirectional}
          segments={(m as CL.AddTripPattern).segments}
        />
      )
    default:
      return null
  }
}
