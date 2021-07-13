import {Divider, FormControl, FormLabel, Input, Stack} from '@chakra-ui/react'
import {useCallback} from 'react'

import useInput from 'lib/hooks/use-controlled-input'

import ConfirmButton from '../confirm-button'
import {CalendarIcon, DeleteIcon} from '../icons'
import * as Panel from '../panel'

import SegmentSpeeds from './segment-speeds'
import TimetableEntry from './timetable-entry'

/** Represents a PatternTimetable */
export default function TimetableComponent({
  bidirectional,
  modificationStops,
  numberOfStops,
  remove,
  segmentDistances,
  timetable,
  update
}): JSX.Element {
  const _changeName = useCallback((name) => update({name}), [update])
  const nameInput = useInput({
    onChange: _changeName,
    value: timetable.name
  })

  return (
    <Panel.Collapsible
      defaultExpanded={false}
      heading={
        <>
          <CalendarIcon style={{display: 'inline-block'}} />
          <strong> {nameInput.value}</strong>
        </>
      }
    >
      <Panel.Body>
        <Stack spacing={4}>
          <FormControl isInvalid={nameInput.isInvalid}>
            <FormLabel htmlFor={nameInput.id}>Name</FormLabel>
            <Input {...nameInput} />
          </FormControl>

          <TimetableEntry
            disablePhasing={bidirectional}
            modificationStops={modificationStops}
            timetable={timetable}
            update={update}
          />

          <Divider />

          {segmentDistances.length > 0 && (
            <SegmentSpeeds
              dwellTime={timetable.dwellTime}
              dwellTimes={timetable.dwellTimes || []}
              numberOfStops={numberOfStops}
              segmentSpeeds={timetable.segmentSpeeds}
              update={update}
            />
          )}

          <ConfirmButton
            description='Are you sure you would like to remove this timetable?'
            isFullWidth
            leftIcon={<DeleteIcon />}
            onConfirm={remove}
            colorScheme='red'
          >
            Delete Timetable
          </ConfirmButton>
        </Stack>
      </Panel.Body>
    </Panel.Collapsible>
  )
}
