// @flow
import React, {Component} from 'react'
import Select from 'react-select'

import {Group as FormGroup} from '../input'
import {secondsToHhMmString} from '../../utils/time'
import type {Feed, ReactSelectResult, RoutePattern} from '../../types'

type Props = {
  feed: Feed,
  onChange: (trip: string) => void,
  patternTrips: string[],
  routes: string[],

  trip: string
}

/** Select trips */
export default class SelectTrip extends Component<Props, State> {
  state = {
    trips: getTrips(this.props)
  }

  componentWillReceiveProps (newProps: Props) {
    this.setState({trips: getTrips(newProps)})
  }

  changeTrip = (trip: ReactSelectResult) => {
    this.props.onChange(trip.value)
  }

  render () {
    return (
      <FormGroup>
        <Select
          clearable={false}
          name='Trip'
          onChange={this.changeTrip}
          options={this.state.trips.map(t => {
            return {value: t.trip_id, label: tripLabel(t)}
          })}
          placeholder='Select Trip'
          value={this.props.trip}
        />
      </FormGroup>
    )
  }
}

// TODO: extract this to a utlity function.
// we have pulled down all trips on the route but show only trips on this pattern
function getTrips ({feed, patternTrips, routes}) {
  const feedNotLoaded = !feed
  if (feedNotLoaded) return []

  const route = feed.routes.find((r) => r.route_id === routes[0])
  const patterns = (route && route.patterns) || []

  return patterns
    .reduce(toTrips, [])
    .filter(onlyTripsInPatternTrips(patternTrips))
    .sort(byStartTime)
}

const toTrips = (trips, pattern: RoutePattern) => [...trips, ...pattern.trips]
const onlyTripsInPatternTrips = patternTrips => trip =>
  patternTrips.indexOf(trip.trip_id) > -1
const byStartTime = (a, b) => a.start_time - b.start_time

const tripLabel = t => {
  return `${t.trip_short_name ? t.trip_short_name + ' ' : t.trip_headsign ? t.trip_headsign + ' ' : ''}, starting ${secondsToHhMmString(t.start_time)} (${Math.round(t.duration / 60)} minute trip)`
}
