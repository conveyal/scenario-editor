import {Box, Heading, Stack} from '@chakra-ui/react'
import turfLength from '@turf/length'

import colors from 'lib/constants/colors'
import {useRoute, useRoutePatterns, useRouteTrips} from 'lib/gtfs/hooks'
import message from 'lib/message'
import useModificationBounds from 'lib/modification/hooks/use-modification-bounds'
import {secondsToHhMmString} from 'lib/utils/time'

import PatternLayer from '../modifications-map/pattern-layer'

import Distance from './distance'
import DaysOfService from './days-of-service'
import MiniMap from './mini-map'
import Phase from './phase'

/**
 * Display an adjust-frequency modification
 */
export default function AdjustFrequency({
  bundle,
  modification
}: {
  bundle: CL.Bundle
  modification: CL.ConvertToFrequency
}) {
  const route = useRoute(bundle._id, modification.feed, modification.routes[0])
  const routePatterns = useRoutePatterns(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )
  const routeTrips = useRouteTrips(
    bundle._id,
    modification.feed,
    modification.routes[0]
  )
  const bounds = useModificationBounds(bundle, modification)

  return (
    <Stack>
      <Heading size='sm'>
        {message('common.route')}: {route.name}
      </Heading>

      <Box>
        <MiniMap bounds={bounds}>
          <PatternLayer
            bundleId={bundle._id}
            color={colors.MODIFIED}
            modification={modification}
          />
        </MiniMap>
      </Box>

      <Box textAlign='center'>
        <i>
          {modification.retainTripsOutsideFrequencyEntries
            ? message('report.keepTripsOutside')
            : message('report.removeTripsOutside')}
        </i>
      </Box>

      <Heading size='sm'>{message('report.newFrequencies')}</Heading>
      <Box as='table'>
        <thead>
          <tr>
            <th>{message('report.frequency.name')}</th>
            <th>{message('report.frequency.direction')}</th>
            <th>{message('report.frequency.startTime')}</th>
            <th>{message('report.frequency.endTime')}</th>
            <th>{message('report.frequency.frequency')}</th>
            <th>{message('report.frequency.daysOfService')}</th>
            <th>{message('report.frequency.nTrips')}</th>
            <th>{message('report.patternLength')}</th>
          </tr>
        </thead>
        <tbody>
          {modification.entries.map((entry, i) => (
            <TimetableEntry
              key={i}
              entry={entry}
              routePatterns={routePatterns}
              routeTrips={routeTrips}
            />
          ))}
        </tbody>
      </Box>
    </Stack>
  )
}

export function TimetableEntry({
  entry,
  routePatterns,
  routeTrips
}: {
  entry: CL.FrequencyEntry
  routePatterns: GTFS.Pattern[]
  routeTrips: GTFS.Trip[]
}) {
  // ...rest will contain days of service
  const {name, startTime, endTime, headwaySecs, sourceTrip, phaseAtStop} = entry
  if (sourceTrip == null) return null // This can happen when a modification is new

  const pattern = routePatterns.find(
    (p) => p.associatedTripIds.findIndex((tripId) => tripId === sourceTrip) > -1
  )
  const trip = routeTrips.find((t) => t.id === sourceTrip)
  const km = turfLength({
    type: 'Feature',
    geometry: pattern.geometry,
    properties: {}
  })

  // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
  const nTrips = Math.floor((endTime - startTime) / headwaySecs)

  // hide bottom border if we will display phasing info.
  const style = phaseAtStop ? {borderBottom: 0} : {}

  return (
    <>
      <tr style={style}>
        <td>{name}</td>
        <td>{trip.directionId}</td>
        <td>{secondsToHhMmString(startTime)}</td>
        <td>{secondsToHhMmString(endTime)}</td>
        <td>{Math.round(headwaySecs / 60)}</td>
        <td>
          <DaysOfService timetable={entry} />
        </td>
        <td>{nTrips}</td>
        <td>
          <Distance km={km} />
        </td>
      </tr>
      {phaseAtStop && (
        <tr style={{borderTop: 0}}>
          <td />
          <td colSpan={7}>
            <>
              <Phase timetable={entry} />
            </>
          </td>
        </tr>
      )}
    </>
  )
}
