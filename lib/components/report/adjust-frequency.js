import {Box, Heading, Stack} from '@chakra-ui/react'
import turfLength from '@turf/length'
import flatten from 'lodash/flatten'
import React from 'react'

import colors from 'lib/constants/colors'
import L from 'lib/leaflet'
import message from 'lib/message'
import {secondsToHhMmString} from 'lib/utils/time'

import PatternLayer from '../modifications-map/pattern-layer'

import Distance from './distance'
import DaysOfService from './days-of-service'
import MiniMap from './mini-map'
import Phase from './phase'

/**
 * Display an adjust-frequency modification
 */
export default function AdjustFrequency(props) {
  const {modification, feedsById} = props
  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])

  const bounds = L.latLngBounds(
    flatten(
      route.patterns.map((p) =>
        p.geometry.coordinates.map(([lat, lon]) => [lon, lat])
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
          <PatternLayer
            feed={feed}
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
            <TimetableEntry key={i} {...props} entry={entry} />
          ))}
        </tbody>
      </Box>
    </Stack>
  )
}

export function TimetableEntry(props) {
  const {
    entry,
    feedsById,
    feedScopedStops,
    modification,
    projectTimetables
  } = props
  // ...rest will contain days of service
  const {
    name,
    startTime,
    endTime,
    headwaySecs,
    sourceTrip,
    phaseAtStop,
    ...rest
  } = entry
  if (sourceTrip == null) return null // This can happen when a modification is new

  const feed = feedsById[modification.feed]
  const route = feed.routes.find((r) => r.route_id === modification.routes[0])
  const pattern = route.patterns.find(
    (p) => p.trips.findIndex((t) => t.trip_id === sourceTrip) > -1
  )
  const trip = pattern.trips.find((t) => t.trip_id === sourceTrip)
  const km = turfLength(pattern.geometry)

  // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
  const nTrips = Math.floor((endTime - startTime) / headwaySecs)

  // hide bottom border if we will display phasing info.
  const style = phaseAtStop ? {borderBottom: 0} : {}

  return (
    <>
      <tr style={style}>
        <td>{name}</td>
        <td>{trip.direction_id}</td>
        <td>{secondsToHhMmString(startTime)}</td>
        <td>{secondsToHhMmString(endTime)}</td>
        <td>{Math.round(headwaySecs / 60)}</td>
        <td>
          <DaysOfService {...rest} />
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
              <Phase
                projectTimetables={projectTimetables}
                timetable={entry}
                feedScopedStops={feedScopedStops}
              />
            </>
          </td>
        </tr>
      )}
    </>
  )
}
