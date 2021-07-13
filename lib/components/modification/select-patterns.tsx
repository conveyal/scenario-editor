import {FormControl, FormLabel} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import flatMap from 'lodash/flatMap'
import {useCallback} from 'react'

import Select from '../select'

const getOptionLabel = fpGet('name')
const getOptionValue = fpGet('id')

/**
 * Select a pattern, given a route and a feed
 */
export default function SelectPatterns({
  onChange,
  patterns,
  trips,
  ...p
}: {
  onChange: (newTrips: string[]) => void
  patterns: GTFS.Pattern[]
  trips?: string[]
}) {
  // Convert to trip IDs before saving as pattern IDs are not stable
  const selectPatterns = useCallback(
    (selectedPatterns: GTFS.Pattern[] | GTFS.Pattern) => {
      if (!selectedPatterns) return onChange([])

      const patterns = Array.isArray(selectedPatterns)
        ? selectedPatterns
        : [selectedPatterns]
      onChange(flatMap(patterns, (pattern) => pattern.associatedTripIds))
    },
    [onChange]
  )

  // Patterns that contain the trips
  const patternsWithTrips = patterns.filter(
    (pattern) =>
      pattern.associatedTripIds.findIndex((trip) =>
        (trips || []).includes(trip)
      ) > -1
  )

  // if trips is null it is a glob selector for all trips on the route
  const patternsChecked = trips == null ? patterns : patternsWithTrips

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
        options={patterns}
        placeholder='Select patterns'
        value={patternsChecked}
      />
    </FormControl>
  )
}
