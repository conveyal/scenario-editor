import {Box, FormControl, FormLabel, Input, Stack} from '@chakra-ui/react'
import uniq from 'lodash/uniq'
import {useCallback, useMemo} from 'react'

import useInput from 'lib/hooks/use-controlled-input'
import intersects from 'lib/utils/arrays-intersect'

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
  feedId,
  remove,
  routePatterns,
  routeStops,
  routeTrips,
  update
}: {
  entry: CL.FrequencyEntry
  feedId: string
  routePatterns: GTFS.Pattern[]
  routeStops: GTFS.Stop[]
  routeTrips: GTFS.Trip[]
  update: (updates: Partial<CL.FrequencyEntry>) => void
  remove: () => void
}) {
  const _changeName = useCallback((name) => update({name}), [update])
  const nameInput = useInput({
    onChange: _changeName,
    value: entry.name
  })

  const _selectPattern = (patternTrips: string[]) =>
    update({patternTrips, sourceTrip: patternTrips[0]})

  const feedScopedModificationStops: GTFS.FeedScopedStop[] = useMemo(() => {
    const patternStopIds = uniq(
      routePatterns
        .filter((pattern) =>
          intersects(pattern.associatedTripIds, entry.patternTrips)
        )
        .flatMap((p) => p.orderedStopIds)
    )
    return patternStopIds.map((id) => {
      const stop = routeStops.find((s) => s.id === id)
      return {
        feedId,
        scopedId: `${feedId}:${stop.id}`,
        ...stop
      }
    })
  }, [entry.patternTrips, feedId, routePatterns, routeStops])

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

          <SelectPatterns
            onChange={_selectPattern}
            patterns={routePatterns}
            trips={entry.patternTrips}
          />

          {entry?.patternTrips?.length > 0 && (
            <SelectTrip
              onChange={(t) => update({sourceTrip: t.id})}
              sourceTrip={entry.sourceTrip}
              trips={routeTrips.filter((t) =>
                entry.patternTrips.includes(t.id)
              )}
            />
          )}

          <Box>
            <TimetableEntry
              modificationStops={feedScopedModificationStops}
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
