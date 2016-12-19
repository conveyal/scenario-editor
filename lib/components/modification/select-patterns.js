/** Select a pattern, given a route and a feed */

import React, {PropTypes} from 'react'
import Select from 'react-select'

import DeepEqualComponent from '../deep-equal'
import {Group as FormGroup} from '../input'

export default class SelectPatterns extends DeepEqualComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    routePatterns: PropTypes.arrayOf(PropTypes.object).isRequired,
    trips: PropTypes.arrayOf(PropTypes.string) // trips can be null indicating a wildcard
  }

  selectPatterns = (selectedPatterns) => {
    const {onChange, routePatterns} = this.props
    // convert to trip IDs as pattern IDs are not stable
    if (selectedPatterns) {
      const patterns = selectedPatterns.map(fromOptionToValue)
      onChange({
        patterns,
        trips: patterns
          .map(fromIdToPattern(routePatterns))
          .map(toTripIds)
          .reduce(flatten, [])
      })
    } else {
      onChange({patterns: [], trips: []})
    }
  }

  render () {
    const {routePatterns, trips} = this.props
    const patternsWithTrips = (pattern) => {
      return pattern.trips.findIndex((trip) => {
        return trips.indexOf(trip.trip_id) > -1
      }) > -1
    }
    // if trips is null it is a glob selector for all trips on the route
    const patternsChecked = trips == null
      ? routePatterns
      : routePatterns.filter(patternsWithTrips)
    return (
      <FormGroup>
        <Select
          multi
          name='Patterns'
          onChange={this.selectPatterns}
          options={routePatterns.map((pattern) => ({value: pattern.pattern_id, label: pattern.name}))}
          placeholder='Select patterns'
          value={patternsChecked.map((pattern) => pattern.pattern_id)}
          />
      </FormGroup>
    )
  }
}

const fromOptionToValue = (option) => option.value
const fromIdToPattern = (patterns) => (id) => patterns.find((pattern) => pattern.pattern_id === id)
const toTripIds = (pattern) => pattern.trips.map((trip) => trip.trip_id)
const flatten = (memo, value) => memo.concat(value)
