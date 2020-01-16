import {faCalendar, faTimes} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'

import {Button} from '../buttons'
import Icon from '../icon'
import {Text} from '../input'
import * as Panel from '../panel'

import TimetableEntry from './timetable-entry'
import SelectTrip from './select-trip'
import SelectPatterns from './select-patterns'

/**
 * Represents a single frequency entry
 */
export default class FrequencyEntry extends React.Component {
  _changeTrip = sourceTrip => {
    this.props.update({sourceTrip})
  }

  _selectPattern = ({trips}) => {
    const p = this.props
    p.setActiveTrips(trips)
    p.update({patternTrips: trips, sourceTrip: trips[0]})
  }

  _changeName = e => {
    this.props.update({name: e.target.value})
  }

  _setActiveTrips = () => {
    const p = this.props
    p.setActiveTrips(p.entry.patternTrips)
  }

  _remove = () => {
    if (
      window.confirm('Are you sure you want to remove this frequency entry?')
    ) {
      this.props.remove()
    }
  }

  render() {
    const {
      entry,
      feed,
      modificationStops,
      routePatterns,
      routes,
      projectTimetables,
      update
    } = this.props
    const patternsWithTrips = routePatterns.filter(
      pattern =>
        !!pattern.trips.find(
          trip => !!entry.patternTrips.includes(trip.trip_id)
        )
    )
    const stopsInPatterns = modificationStops.filter(
      ms =>
        !!patternsWithTrips.find(
          pattern =>
            !!pattern.stops.find(
              stop => stop.stop_id === ms.stop_id.split(':')[1]
            )
        )
    )

    // TODO Fix `setActiveTrips` on focus
    return (
      <Panel.Collapsible
        heading={() => (
          <>
            <Icon icon={faCalendar} />
            <strong> {entry.name}</strong>
          </>
        )}
      >
        <Panel.Body>
          <Text name='Name' onChange={this._changeName} value={entry.name} />

          {routePatterns && (
            <SelectPatterns
              onChange={this._selectPattern}
              routePatterns={routePatterns}
              trips={entry.patternTrips}
            />
          )}

          {get(entry, 'patternTrips.length') > 0 && (
            <SelectTrip
              feed={feed}
              onChange={this._changeTrip}
              patternTrips={entry.patternTrips}
              routes={routes}
              trip={entry.sourceTrip}
            />
          )}

          <TimetableEntry
            bidirectional={false}
            modificationStops={stopsInPatterns}
            projectTimetables={projectTimetables}
            timetable={entry}
            update={update}
          />

          <Button
            block
            onClick={this._remove}
            style='danger'
            title='Delete frequency entry'
          >
            <Icon icon={faTimes} /> Delete frequency entry
          </Button>
        </Panel.Body>
      </Panel.Collapsible>
    )
  }
}
