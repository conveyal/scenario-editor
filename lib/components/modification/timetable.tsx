import {Divider, FormControl, FormLabel, Input, Stack} from '@chakra-ui/core'
import {faCalendar} from '@fortawesome/free-solid-svg-icons'
import {useCallback} from 'react'

import useInput from 'lib/hooks/use-controlled-input'

import ConfirmButton from '../confirm-button'
import Icon from '../icon'
import * as Panel from '../panel'

import SegmentSpeeds from './segment-speeds'
import TimetableEntry from './timetable-entry'

/** Represents a PatternTimetable */
export default function TimetableComponent({
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
      heading={() => (
        <>
          <Icon icon={faCalendar} />
          <strong> {nameInput.value}</strong>
        </>
      )}
    >
      <Panel.Body>
        <Stack spacing={4}>
          <FormControl isInvalid={nameInput.isInvalid}>
            <FormLabel htmlFor={nameInput.id}>Name</FormLabel>
            <Input {...nameInput} />
          </FormControl>

          <TimetableEntry
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
            action='Delete Timetable'
            description='Are you sure you would like to remove this timetable?'
            isFullWidth
            leftIcon='delete'
            onConfirm={remove}
            variantColor='red'
          />
        </Stack>
      </Panel.Body>
    </Panel.Collapsible>
  )
}
