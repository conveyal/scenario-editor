import {
  Alert,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Stack
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'

import {useModification} from 'lib/hooks/use-model'
import message from 'lib/message'
import useAvailablePhaseStops from 'lib/modification/hooks/use-available-phase-stops'
import usePhaseAvailableTimetables from 'lib/modification/hooks/use-phase-timetables'

import Select from '../select'
import MinutesSeconds from '../minutes-seconds'
import DocsLink from '../docs-link'

const getStopName = fpGet('stop.name')
const getStopId = fpGet('scopedId')

export default function Phase({
  disabled = false,
  modificationStops,
  timetable,
  update
}: {
  disabled?: boolean
  modificationStops: GTFS.FeedScopedStop[]
  timetable: CL.AbstractTimetable
  update: (updates: Partial<CL.AbstractTimetable>) => void
}) {
  const allPhaseOptions = usePhaseAvailableTimetables()
  // Filter out the current timetable
  const availablePhaseOptions = allPhaseOptions.filter(
    (tt) => tt.timetable._id !== timetable._id
  )

  const [selectedModificationId, selectedTimetableId] = (
    timetable.phaseFromTimetable || ''
  ).split(':')
  const selectedModification = useModification(selectedModificationId)
  const selectedTimetable = availablePhaseOptions.find(
    (tt) => tt.timetable._id === selectedTimetableId
  )?.timetable

  function _setPhaseFromTimetable(tt) {
    update({
      phaseFromStop: null,
      phaseFromTimetable: tt ? tt.phaseId : null
    })
  }

  return (
    <Stack spacing={4} mb={4}>
      <Heading size='sm'>
        <span>Phasing </span>
        <DocsLink to='edit-scenario/phasing' />
      </Heading>
      <FormControl isDisabled={disabled}>
        <FormLabel htmlFor='phaseAtStop'>{message('phasing.atStop')}</FormLabel>
        <Select
          inputId='phaseAtStop'
          isClearable
          isDisabled={disabled}
          name={message('phasing.atStop')}
          getOptionLabel={getStopName}
          getOptionValue={getStopId}
          onChange={(s) => update({phaseAtStop: s.scopedId})}
          options={modificationStops}
          placeholder={message('phasing.atStop')}
          value={modificationStops.find(
            (s) => s.scopedId === timetable.phaseAtStop
          )}
        />
      </FormControl>
      {disabled && <Alert status='info'>{message('phasing.disabled')}</Alert>}
      {timetable.phaseAtStop && (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor='phaseFromTimetable'>
              {message('phasing.fromTimetable')}
            </FormLabel>
            <Select
              inputId='phaseFromTimetable'
              isClearable
              isDisabled={disabled}
              name={message('phasing.fromTimetable')}
              getOptionLabel={(t) => t.phaseLabel}
              getOptionValue={(t) => t.phaseId}
              onChange={_setPhaseFromTimetable}
              options={availablePhaseOptions}
              placeholder={message('phasing.fromTimetable')}
              value={selectedTimetable}
            />
          </FormControl>
          {timetable.phaseFromTimetable &&
            (selectedTimetable && selectedModification ? (
              <Box>
                <PhaseAtTimetable
                  selectedTimetable={selectedTimetable}
                  timetable={timetable}
                  update={update}
                />
              </Box>
            ) : (
              <Alert status='error'>
                <strong>Selected timetable no longer exists.</strong> Please
                clear or change your phasing options or there will be errors
                during analysis.
              </Alert>
            ))}
        </Stack>
      )}
    </Stack>
  )
}

function PhaseAtTimetable({
  timetable,
  selectedTimetable,
  update
}: {
  timetable: CL.AbstractTimetable
  selectedTimetable: CL.AbstractTimetable
  update: (updates: Partial<CL.AbstractTimetable>) => void
}) {
  const availableStops = useAvailablePhaseStops(timetable.phaseFromTimetable)
  return (
    <Stack spacing={4}>
      {selectedTimetable.headwaySecs !== timetable.headwaySecs && (
        <Alert status='error'>
          {message('phasing.headwayMismatchWarning', {
            selectedTimetableHeadway: selectedTimetable.headwaySecs / 60
          })}
        </Alert>
      )}
      {availableStops?.length > 0 ? (
        <FormControl>
          <FormLabel htmlFor='phaseFromStop'>
            {message('phasing.fromStop')}
          </FormLabel>
          <Select
            inputId='phaseFromStop'
            getOptionLabel={getStopName}
            getOptionValue={getStopId}
            name={message('phasing.fromStop')}
            onChange={(s) => update({phaseFromStop: s.scopedId})}
            options={availableStops}
            placeholder={message('phasing.fromStop')}
            value={availableStops.find(
              (s) => s.scopedId === timetable.phaseFromStop
            )}
          />
        </FormControl>
      ) : (
        <Alert status='error'>
          {message('phasing.noAvailableStopsWarning')}
        </Alert>
      )}
      {timetable.phaseFromStop && (
        <MinutesSeconds
          label={message('phasing.minutes')}
          onChange={(phaseSeconds) => update({phaseSeconds})}
          seconds={timetable.phaseSeconds}
        />
      )}
    </Stack>
  )
}
