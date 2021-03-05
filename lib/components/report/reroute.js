/** Display a reroute modification in the report view */
import {Box, Heading, Stack} from '@chakra-ui/react'
import flatten from 'lodash/flatten'
import sum from 'lodash/sum'
import React from 'react'
import turfLength from '@turf/length'
import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'

import L from 'lib/leaflet'
import message from 'lib/message'
import {getPatternsForModification} from 'lib/utils/patterns'
import getStops from 'lib/utils/get-stops'

import RerouteLayer from '../modifications-map/reroute-layer'

import Speed from './speed'
import MiniMap from './mini-map'
import Distance from './distance'

export default function Reroute(props) {
  const {modification, feedsById} = props
  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])

  const bounds = L.latLngBounds(
    flatten(
      route.patterns.map((p) =>
        p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
      )
    ).concat(
      flatten(
        modification.segments.map((s) =>
          s.geometry.coordinates.map(([lat, lon]) => [lon, lat])
        )
      )
    )
  )

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}:{' '}
        {!!route.route_short_name && route.route_short_name}{' '}
        {!!route.route_long_name && route.route_long_name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <RerouteLayer feed={feed} modification={modification} />
        </MiniMap>
      </Box>

      {getPatternsForModification({feed, modification}).map((pattern, i) => (
        <Box key={i}>
          <Pattern pattern={pattern} {...props} />
        </Box>
      ))}
    </Stack>
  )
}

function Pattern(props) {
  const {modification, feedsById, pattern} = props
  const feed = feedsById[modification.feed]

  // all calculations below are in kilometers
  const patternLength = turfLength(pattern.geometry)
  const stops = getStops(modification.segments)
  const segmentLength = stops.slice(-1)[0].distanceFromStart / 1000
  const segmentDistances = modification.segments.map((seg) =>
    turfLength(seg.geometry)
  )

  const {segmentSpeeds} = modification
  const totalDistance = sum(segmentDistances)
  const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
  const speed =
    weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance

  // figure out removed segment length
  const fromStopIndex =
    modification.fromStop != null
      ? pattern.stops.findIndex((s) => s.stop_id === modification.fromStop)
      : 0
  // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
  const toStopIndex =
    modification.toStop != null
      ? pattern.stops.findIndex(
          (s, i) => i >= fromStopIndex && s.stop_id === modification.toStop
        )
      : pattern.stops.length - 1

  const modificationAppliesToThisPattern =
    fromStopIndex !== -1 && toStopIndex !== -1
  if (!modificationAppliesToThisPattern) return []

  let nStopsRemoved = toStopIndex - fromStopIndex
  if (modification.fromStop && modification.toStop) nStopsRemoved-- // -1 because it's an exclusive interval on both sides, don't include from and to stops

  let nStopsAdded = stops.length

  // the endpoints are included, subtract them off where they overlap with existing stops
  if (modification.fromStop) nStopsAdded--
  if (modification.toStop) nStopsAdded--

  // NB using indices here so we get an object even if fromStop or toStop is null
  // stops in pattern are in fact objects but they only have stop ID.
  const fromStop = feed.stopsById[pattern.stops[fromStopIndex].stop_id]
  const toStop = feed.stopsById[pattern.stops[toStopIndex].stop_id]

  const geometry = lineSlice(
    point([fromStop.stop_lon, fromStop.stop_lat]),
    point([toStop.stop_lon, toStop.stop_lat]),
    {
      type: 'Feature',
      geometry: pattern.geometry,
      properties: {}
    }
  )

  const removedLengthThisPattern = turfLength(geometry)

  return (
    <table>
      <tbody>
        <tr>
          <th>{message('report.patternName')}</th>
          <td>{pattern.name}</td>
        </tr>
        <tr>
          <th>{message('report.reroute.originalLength')}</th>
          <td>
            <Distance km={patternLength} />
          </td>
        </tr>
        <tr>
          <th>{message('report.reroute.newLength')}</th>
          <td>
            <Distance
              km={patternLength - removedLengthThisPattern + segmentLength}
            />
          </td>
        </tr>
        <tr>
          <th>{message('report.reroute.segmentLength')}</th>
          <td>
            <Distance km={segmentLength} />
          </td>
        </tr>
        <tr>
          <th>{message('report.reroute.lengthDelta')}</th>
          <td>
            <Distance km={segmentLength - removedLengthThisPattern} />
          </td>
        </tr>
        <tr>
          <th>{message('modification.addedSegments.speed')}</th>
          <td>
            <Speed kmh={speed} />
          </td>
        </tr>
        <tr>
          <th>{message('modification.addedSegments.dwell')}</th>
          <td>{modification.dwell}</td>
        </tr>
        <tr>
          <th>{message('report.reroute.nStopsRemoved')}</th>
          <td>{nStopsRemoved}</td>
        </tr>
        <tr>
          <th>{message('report.reroute.nStopsAdded')}</th>
          <td>{nStopsAdded}</td>
        </tr>
      </tbody>
    </table>
  )
}
