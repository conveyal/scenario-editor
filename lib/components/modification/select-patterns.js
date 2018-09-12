// @flow
import React, {PureComponent} from 'react'
import Select from 'react-select'

import {Group as FormGroup} from '../input'
import type {ClearableReactSelectMultiResult, RoutePattern} from '../../types'

type Props = {
  onChange: ({
    patterns: string[],
    trips: string[]
  }) => void,
  routePatterns: RoutePattern[],
  trips: null | string[] // trips can be null indicating a wildcard
}

/**
 * Select a pattern, given a route and a feed
 */
export default class SelectPatterns extends PureComponent<void, Props, void> {
  selectPatterns = (selectedPatterns: ClearableReactSelectMultiResult) => {
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
    const patternsWithTrips = pattern => {
      return (
        pattern.trips.findIndex(trip => {
          return trips && trips.indexOf(trip.trip_id) > -1
        }) > -1
      )
    }
    // if trips is null it is a glob selector for all trips on the route
    const patternsChecked = trips == null
      ? routePatterns
      : routePatterns.filter(patternsWithTrips)
    return (
      <FormGroup>
        <label htmlFor='Patterns'>Select patterns</label>
        <Select
          multi
          name='Patterns'
          onChange={this.selectPatterns}
          options={routePatterns.map(pattern => ({
            value: pattern.pattern_id,
            label: pattern.name
          }))}
          placeholder='Select patterns'
          value={patternsChecked.map(pattern => pattern.pattern_id)}
        />
      </FormGroup>
    )
  }
}

const fromOptionToValue = option => option.value
const fromIdToPattern = patterns => id =>
  patterns.find(pattern => pattern.pattern_id === id)
const toTripIds = pattern =>
  (pattern ? pattern.trips.map(trip => trip.trip_id) : [])
const flatten = (memo, value) => memo.concat(value)
