// @flow
import {latLngBounds} from 'leaflet'
import React, {Component} from 'react'
import lineDistance from '@turf/line-distance'

import DaysOfService from './days-of-service'
import Distance from './distance'
import tryCatchRender from '../try-catch-render'
import MiniMap from './mini-map'
import Phase from './phase'
import AddTripPatternLayer from '../scenario-map/add-trip-pattern-layer'
import Speed from './speed'
import messages from '../../utils/messages'
import {getAverageSpeedOfSegments} from '../../utils/segments'
import {secondsToHhMmString} from '../../utils/time'

import type {Modification, Stop, Timetable} from '../../types'

type Props = {
  modification: Modification,
  feedScopedStops: Stop[],
  scenarioTimetables: Timetable[]
}

/**
 * The summary/report view of an add trip pattern modification
 */
class AddTrips extends Component<void, Props, void> {
  render () {
    const {modification} = this.props
    const segmentDistances = modification.segments
      .map(seg => lineDistance(seg.geometry, 'kilometers'))

    const km = segmentDistances.reduce((a, b) => a + b, 0)
    const bounds = latLngBounds([].concat(...modification.segments.map(seg => seg.geometry.coordinates.map(([lon, lat]) => [lat, lon]))))

    return <div>
      <MiniMap bounds={bounds}>
        <AddTripPatternLayer
          bidirectional
          segments={modification.segments}
          />
      </MiniMap>

      <i><Distance km={km} />, {modification.bidirectional
        ? messages.report.addTrips.bidirectional
        : messages.report.addTrips.unidirectional}</i>

      <table className='table table-striped'>
        <thead>
          <tr>
            <th>{messages.report.frequency.name}</th>
            <th>{messages.report.frequency.startTime}</th>
            <th>{messages.report.frequency.endTime}</th>
            <th>{messages.report.frequency.frequency}</th>
            <th>{messages.report.frequency.speed}</th>
            <th>{messages.report.frequency.daysOfService}</th>
            <th>{messages.report.frequency.nTrips}</th>
          </tr>
        </thead>
        <tbody>
          {modification.timetables.map(tt => this.renderTimetable({ ...tt, segmentDistances }))}
        </tbody>
      </table>
    </div>
  }

  // TODO duplicate code from adjust-frequency
  // ...rest will include days of service
  renderTimetable ({
    bidirectional,
    id,
    endTime,
    headwaySecs,
    lengthKm,
    name,
    sourceTrip,
    segmentSpeeds,
    segmentDistances,
    startTime,
    ...rest
  }: Timetable) {
    const {feedScopedStops, scenarioTimetables} = this.props
    // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
    const nTrips = Math.floor((endTime - startTime) / headwaySecs)

    const speed = getAverageSpeedOfSegments({ segmentSpeeds, segmentDistances })

    const out = [
      <tr key={`${id}-summary`}>
        <td>{name}</td>
        <td>{secondsToHhMmString(startTime)}</td>
        <td>{secondsToHhMmString(endTime)}</td>
        <td>{Math.round(headwaySecs / 60)}</td>
        <td><Speed kmh={speed} /></td>
        <td><DaysOfService {...rest} /></td>
        <td>{bidirectional ? nTrips * 2 : nTrips}</td>
      </tr>
    ]

    // if phasing existed and then is cleared, only the phaseAtStop is cleared so that it can be
    // re-enabled easily.
    if (rest.phaseAtStop) {
      // hidden, empty row so that striping order is preserved
      // alternate rows are shaded, and we want the phasing row to be shaded the same as the row
      // above it.
      out.push(<tr aria-hidden style={{ height: 0, border: 0 }} key={`${id}-empty`} />)

      // TODO how to indicate to screen readers that this is associated with the row above?
      out.push(<tr key={`${id}-phase`} style={{borderTop: 0}}>
        <td />
        <td colSpan={6}>
          <div>
            <Phase
              scenarioTimetables={scenarioTimetables}
              timetable={rest}
              feedScopedStops={feedScopedStops}
            />
          </div>
        </td>
      </tr>)
    }

    return out
  }
}

export default tryCatchRender(AddTrips)
