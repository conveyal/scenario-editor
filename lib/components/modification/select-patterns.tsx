import {FormControl, FormLabel} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import flatMap from 'lodash/flatMap'
import {useCallback} from 'react'
import {useSelector} from 'react-redux'

import selectRoutePatterns from 'lib/selectors/route-patterns'

import Select from '../select'

const getOptionLabel = fpGet('name')
const getOptionValue = fpGet('pattern_id')

/**
 * Select a pattern, given a route and a feed
 */
export default function SelectPatterns({onChange, trips, ...p}) {
  const routePatterns = useSelector(selectRoutePatterns)

  // Convert to trip IDs before saving as pattern IDs are not stable
  const selectPatterns = useCallback(
    (selectedPatterns) => {
      if (!selectedPatterns) return onChange([])

      const patterns = Array.isArray(selectedPatterns)
        ? selectedPatterns
        : [selectedPatterns]
      onChange(
        flatMap(patterns, (pattern) => pattern.trips.map((t) => t.trip_id))
      )
    },
    [onChange]
  )

  // Patterns that contain the trips
  const patternsWithTrips = routePatterns.filter(
    (pattern) =>
      pattern.trips.findIndex((trip) => (trips || []).includes(trip.trip_id)) >
      -1
  )

  // if trips is null it is a glob selector for all trips on the route
  const patternsChecked = trips == null ? routePatterns : patternsWithTrips

  return (
    <FormControl {...p}>
      <FormLabel htmlFor='Patterns'>Select patterns</FormLabel>
      <Select
        name='Patterns'
        inputId='Patterns'
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        isMulti={true as any}
        onChange={selectPatterns}
        options={routePatterns}
        placeholder='Select patterns'
        value={patternsChecked}
      />
    </FormControl>
  )
}
