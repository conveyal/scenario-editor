import {Box, Stack} from '@chakra-ui/react'
import sum from 'lodash/sum'
import React from 'react'
import turfLength from '@turf/length'

import message from 'lib/message'
import L from 'lib/leaflet'
import {secondsToHhMmString} from 'lib/utils/time'

import AddTripPatternLayer from '../modifications-map/add-trip-pattern-layer'

import DaysOfService from './days-of-service'
import Distance from './distance'
import MiniMap from './mini-map'
import Phase from './phase'
import Speed from './speed'

/**
 * The summary/report view of an add trip pattern modification
 */
export default function AddTrips(p) {
  const {modification} = p
  const segments = modification.segments || []
  const segmentDistances = segments.map((seg) => turfLength(seg.geometry))

  const km = segmentDistances.reduce((a, b) => a + b, 0)
  const bounds = L.latLngBounds(
    [].concat(
      ...segments.map((seg) =>
        seg.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      )
    )
  )

  return (
    <Stack>
      <Box>
        <MiniMap bounds={bounds}>
          <AddTripPatternLayer bidirectional segments={segments} />
        </MiniMap>
      </Box>

      <Box textAlign='center'>
        <i>
          <Distance km={km} />,{' '}
          {modification.bidirectional
            ? message('report.addTrips.bidirectional')
            : message('report.addTrips.unidirectional')}
        </i>
      </Box>

      <Box as='table'>
        <thead>
          <tr>
            <th>{message('report.frequency.name')}</th>
            <th>{message('report.frequency.startTime')}</th>
            <th>{message('report.frequency.endTime')}</th>
            <th>{message('report.frequency.frequency')}</th>
            <th>{message('report.frequency.speed')}</th>
            <th>{message('report.frequency.daysOfService')}</th>
            <th>{message('report.frequency.nTrips')}</th>
          </tr>
        </thead>
        <tbody>
          {(modification.timetables || []).map((tt) => (
            <Timetable
              bidirectional={!!modification.bidirectional}
              feedScopedStops={p.feedScopedStops}
              key={tt._id}
              projectTimetables={p.projectTimetables}
              segmentDistances={segmentDistances}
              timetable={tt}
            />
          ))}
        </tbody>
      </Box>
    </Stack>
  )
}

function Timetable({
  bidirectional,
  feedScopedStops,
  projectTimetables,
  segmentDistances,
  timetable
}) {
  const {endTime, headwaySecs, name, segmentSpeeds, startTime} = timetable
  // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
  const nTrips = Math.floor((endTime - startTime) / headwaySecs)

  const totalDistance = sum(segmentDistances)
  const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
  const speed =
    weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance

  return (
    <>
      <tr style={{borderBottomWidth: timetable.phaseAtStop ? '0' : '1px'}}>
        <td>{name}</td>
        <td>{secondsToHhMmString(startTime)}</td>
        <td>{secondsToHhMmString(endTime)}</td>
        <td>{Math.round(headwaySecs / 60)}</td>
        <td>
          <Speed kmh={speed} />
        </td>
        <td>
          <DaysOfService {...timetable} />
        </td>
        <td>{bidirectional ? nTrips * 2 : nTrips}</td>
      </tr>
      {timetable.phaseAtStop && (
        <tr style={{borderTop: 0}}>
          <td />
          <td colSpan={6}>
            <div>
              <Phase
                projectTimetables={projectTimetables}
                timetable={timetable}
                feedScopedStops={feedScopedStops}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
