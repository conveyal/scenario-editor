import {Box, Heading, Stack} from '@chakra-ui/react'
import sum from 'lodash/sum'
import turfLength from '@turf/length'
import lineSlice from '@turf/line-slice'
import {feature, point} from '@turf/helpers'

import {useRouteStops} from 'lib/gtfs/hooks'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import useModificationRoute from 'lib/modification/hooks/use-modification-route'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'
import getStops from 'lib/utils/get-stops'

import RerouteLayer from '../modifications-map/reroute-layer'

import Speed from './speed'
import MiniMap from './mini-map'
import Distance from './distance'

/**
 * Display a reroute modification in the report view
 */
export default function Reroute({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.Reroute
}) {
  const bounds = useModificationBounds(bundle, modification)
  const route = useModificationRoute(bundle, modification)
  const patterns = useModificationPatterns(bundle, modification)
  const stops = useRouteStops(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}: {route.name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <RerouteLayer bundleId={bundle._id} modification={modification} />
        </MiniMap>
      </Box>

      {patterns.map((pattern, i) => (
        <Box key={i}>
          <Pattern
            modification={modification}
            pattern={pattern}
            routeStops={stops}
          />
        </Box>
      ))}
    </Stack>
  )
}

function Pattern({
  modification,
  pattern,
  routeStops
}: {
  modification: CL.Reroute
  pattern: GTFS.Pattern
  routeStops: GTFS.Stop[]
}) {
  // all calculations below are in kilometers
  const patternLength = turfLength(feature(pattern.geometry))
  const stops = getStops(modification.segments)
  const segmentLength = stops.slice(-1)[0].distanceFromStart / 1000
  const segmentDistances = modification.segments.map((seg) =>
    turfLength(feature(seg.geometry))
  )

  const {segmentSpeeds} = modification
  const totalDistance = sum(segmentDistances)
  const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
  const speed =
    weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance

  // figure out removed segment length
  const fromStopIndex =
    modification.fromStop != null
      ? pattern.orderedStopIds.findIndex(
          (stopId) => stopId === modification.fromStop
        )
      : 0
  // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
  const toStopIndex =
    modification.toStop != null
      ? pattern.orderedStopIds.findIndex(
          (stopId, i) => i >= fromStopIndex && stopId === modification.toStop
        )
      : pattern.orderedStopIds.length - 1

  const modificationAppliesToThisPattern =
    fromStopIndex !== -1 && toStopIndex !== -1
  if (!modificationAppliesToThisPattern) return null

  let nStopsRemoved = toStopIndex - fromStopIndex
  if (modification.fromStop && modification.toStop) nStopsRemoved-- // -1 because it's an exclusive interval on both sides, don't include from and to stops

  let nStopsAdded = stops.length

  // the endpoints are included, subtract them off where they overlap with existing stops
  if (modification.fromStop) nStopsAdded--
  if (modification.toStop) nStopsAdded--

  // NB using indices here so we get an object even if fromStop or toStop is null
  // stops in pattern are in fact objects but they only have stop ID.
  const fromStop = routeStops.find((s) => s.id === modification.fromStop)
  const toStop = routeStops.find((s) => s.id === modification.toStop)

  const geometry = lineSlice(
    point([fromStop.lon, fromStop.lat]),
    point([toStop.lon, toStop.lat]),
    feature(pattern.geometry)
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
          <td>{modification.dwellTime}</td>
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
