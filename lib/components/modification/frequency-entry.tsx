import {Box, FormControl, FormLabel, Input, Stack} from '@chakra-ui/react'
import get from 'lodash/get'
import {useCallback} from 'react'

import useInput from 'lib/hooks/use-controlled-input'

import ConfirmButton from '../confirm-button'
import {CalendarIcon, DeleteIcon} from '../icons'
import * as Panel from '../panel'

import TimetableEntry from './timetable-entry'
import SelectTrip from './select-trip'
import SelectPatterns from './select-patterns'

/**
 * Represents a single frequency entry
 */
export default function FrequencyEntry({
  entry,
  feed,
  modificationStops,
  routePatterns,
  routes,
  update,
  remove
}) {
  const _changeName = useCallback((name) => update({name}), [update])
  const nameInput = useInput({
    onChange: _changeName,
    value: entry.name
  })

  const _changeTrip = (sourceTrip) => update({sourceTrip})
  const _selectPattern = (trips) =>
    update({patternTrips: trips, sourceTrip: trips[0]})

  const patternsWithTrips = routePatterns.filter(
    (pattern) =>
      !!pattern.trips.find(
        (trip) => !!entry.patternTrips.includes(trip.trip_id)
      )
  )
  const stopsInPatterns = modificationStops.filter(
    (ms) =>
      !!patternsWithTrips.find(
        (pattern) =>
          !!pattern.stops.find(
            (stop) => stop.stop_id === ms.stop_id.split(':')[1]
          )
      )
  )

  return (
    <Panel.Collapsible
      heading={
        <>
          <CalendarIcon style={{display: 'inline-block'}} />
          <strong> {entry.name}</strong>
        </>
      }
    >
      <Panel.Body>
        <Stack spacing={4}>
          <FormControl isInvalid={nameInput.isInvalid}>
            <FormLabel htmlFor={nameInput.id}>Name</FormLabel>
            <Input {...nameInput} />
          </FormControl>

          {routePatterns && (
            <SelectPatterns
              onChange={_selectPattern}
              routePatterns={routePatterns}
              trips={entry.patternTrips}
            />
          )}

          {get(entry, 'patternTrips.length') > 0 && (
            <SelectTrip
              feed={feed}
              onChange={_changeTrip}
              patternTrips={entry.patternTrips}
              routes={routes}
              trip={entry.sourceTrip}
            />
          )}

          <Box>
            <TimetableEntry
              modificationStops={stopsInPatterns}
              timetable={entry}
              update={update}
            />
          </Box>

          <ConfirmButton
            description='Are you sure you would like to remove this frequency entry?'
            isFullWidth
            leftIcon={<DeleteIcon />}
            onConfirm={remove}
            colorScheme='red'
          >
            Delete frequency entry
          </ConfirmButton>
        </Stack>
      </Panel.Body>
    </Panel.Collapsible>
  )
}
