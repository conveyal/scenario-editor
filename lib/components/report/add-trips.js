// @flow
import {latLngBounds} from 'leaflet'
import React, {Component} from 'react'
import lineDistance from '@turf/line-distance'

import tryCatchRender from '../try-catch-render'
import AddTripPatternLayer from '../modifications-map/add-trip-pattern-layer'
import messages from '../../utils/messages'
import {getAverageSpeedOfSegments} from '../../utils/segments'
import {secondsToHhMmString} from '../../utils/time'
import type {Modification, GTFSStop, Timetable} from '../../types'

import Speed from './speed'
import Phase from './phase'
import MiniMap from './mini-map'
import Distance from './distance'
import DaysOfService from './days-of-service'

type Props = {
  feedScopedStops: GTFSStop[],
  modification: Modification,
  projectTimetables: Timetable[]
}

/**
 * The summary/report view of an add trip pattern modification
 */
class AddTrips extends Component<void, Props, void> {
  render () {
    const {modification} = this.props
    const segments = modification.segments || []
    const segmentDistances = segments.map(seg =>
      lineDistance(seg.geometry, 'kilometers')
    )

    const km = segmentDistances.reduce((a, b) => a + b, 0)
    const bounds = latLngBounds(
      [].concat(
        ...segments.map(seg =>
          seg.geometry.coordinates.map(([lon, lat]) => [lat, lon])
        )
      )
    )

    return (
      <div>
        <MiniMap bounds={bounds}>
          <AddTripPatternLayer bidirectional segments={segments} />
        </MiniMap>

        <i>
          <Distance km={km} />,{' '}
          {modification.bidirectional
            ? messages.report.addTrips.bidirectional
            : messages.report.addTrips.unidirectional}
        </i>

        <table className='table table-striped'>
          <thead>
            <tr>
              <th>
                {messages.report.frequency.name}
              </th>
              <th>
                {messages.report.frequency.startTime}
              </th>
              <th>
                {messages.report.frequency.endTime}
              </th>
              <th>
                {messages.report.frequency.frequency}
              </th>
              <th>
                {messages.report.frequency.speed}
              </th>
              <th>
                {messages.report.frequency.daysOfService}
              </th>
              <th>
                {messages.report.frequency.nTrips}
              </th>
            </tr>
          </thead>
          <tbody>
            {(modification.timetables || []).map(tt =>
              this.renderTimetable({
                bidirectional: !!modification.bidirectional,
                segmentDistances,
                timetable: tt
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }

  // TODO duplicate code from adjust-frequency
  // ...rest will include days of service
  renderTimetable ({
    bidirectional,
    segmentDistances,
    timetable
  }: {
    bidirectional: boolean,
    segmentDistances: number[],
    timetable: Timetable
  }) {
    const {feedScopedStops, projectTimetables} = this.props
    const {endTime, headwaySecs, _id, name, segmentSpeeds, startTime} = timetable
    // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
    const nTrips = Math.floor((endTime - startTime) / headwaySecs)

    const speed = getAverageSpeedOfSegments({segmentSpeeds, segmentDistances})

    const out = [
      <tr key={`${_id}-summary`}>
        <td>
          {name}
        </td>
        <td>
          {secondsToHhMmString(startTime)}
        </td>
        <td>
          {secondsToHhMmString(endTime)}
        </td>
        <td>
          {Math.round(headwaySecs / 60)}
        </td>
        <td>
          <Speed kmh={speed} />
        </td>
        <td>
          <DaysOfService {...timetable} />
        </td>
        <td>
          {bidirectional ? nTrips * 2 : nTrips}
        </td>
      </tr>
    ]

    // if phasing existed and then is cleared, only the phaseAtStop is cleared so that it can be
    // re-enabled easily.
    if (timetable.phaseAtStop) {
      // hidden, empty row so that striping order is preserved
      // alternate rows are shaded, and we want the phasing row to be shaded the same as the row
      // above it.
      out.push(
        <tr aria-hidden style={{height: 0, border: 0}} key={`${_id}-empty`} />
      )

      // TODO how to indicate to screen readers that this is associated with the row above?
      out.push(
        <tr key={`${_id}-phase`} style={{borderTop: 0}}>
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
      )
    }

    return out
  }
}

export default tryCatchRender(AddTrips)
