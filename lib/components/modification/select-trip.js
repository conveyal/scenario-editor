/** Select trips */

import React, {Component, PropTypes} from 'react'
import Select from 'react-select'

import {Group as FormGroup} from '../input'
import {secondsToHhMmString} from '../../utils/time'

export default class SelectTrip extends Component {
  static propTypes = {
    trip: PropTypes.string,
    routes: PropTypes.array.isRequired,
    feed: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    patternTrips: PropTypes.array
  }

  state = {
    trips: getTrips(this.props)
  }

  componentWillReceiveProps (newProps) {
    this.setState(Object.assign({}, this.state, { trips: getTrips(newProps) }))
  }

  changeTrip = (trip) => {
    this.props.onChange(trip.value)
  }

  render () {
    return (
      <FormGroup>
        <Select
          name='Trip'
          onChange={this.changeTrip}
          options={this.state.trips.map((t) => { return { value: t.trip_id, label: tripLabel(t) } })}
          placeholder='Select Trip'
          value={this.props.trip}
          />
      </FormGroup>
    )
  }
}

// TODO: extract this to a utlity function.
// we have pulled down all trips on the route but show only trips on this pattern
function getTrips ({
  feed,
  patternTrips,
  routes
}) {
  const feedNotLoaded = !feed
  if (feedNotLoaded) return []

  const patterns = feed.routesById[routes[0]].patterns
  const patternsNotLoaded = !patterns
  if (patternsNotLoaded) return []

  return patterns.reduce(toTrips, [])
    .filter(onlyTripsInPatternTrips(patternTrips))
    .sort(byStartTime)
}

const toTrips = (trips, pattern) => trips.concat(pattern.trips)
const onlyTripsInPatternTrips = (patternTrips) => (trip) => patternTrips.indexOf(trip.trip_id) > -1
const byStartTime = (a, b) => a.start_time - b.start_time

const tripLabel = (t) => {
  return `${t.trip_short_name ? t.trip_short_name + ' ' : (t.trip_headsign ? t.trip_headsign + ' ' : '')}, starting ${secondsToHhMmString(t.start_time)} (${Math.round(t.duration / 60)} minute trip)`
}
