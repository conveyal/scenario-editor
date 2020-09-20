import {Alert, FormControl, FormLabel, Heading, Stack} from '@chakra-ui/core'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import React from 'react'
import {useSelector} from 'react-redux'

import message from 'lib/message'
import selectPhaseFromTimetableStops from 'lib/selectors/all-phase-from-timetable-stops'
import selectProjectTimetables from 'lib/selectors/project-timetables'
import {toString as timetableToString} from 'lib/utils/timetable'

import Icon from '../icon'
import Select from '../select'
import MinutesSeconds from '../minutes-seconds'

const getStopName = fpGet('stop_name')
const getStopId = fpGet('stop_id')

export default function Phase({
  disabled = false,
  modificationStops,
  timetable,
  update
}) {
  const allPhaseFromTimetableStops = useSelector(selectPhaseFromTimetableStops)
  const projectTimetables = useSelector(selectProjectTimetables)
  const selectedPhaseFromTimetableStops =
    allPhaseFromTimetableStops[timetable.phaseFromTimetable]
  const availableTimetables = projectTimetables.filter(
    (tt) => tt._id !== timetable._id
  )
  const selectedTimetableId = (timetable.phaseFromTimetable || '').split(':')[1]
  const selectedTimetable = availableTimetables.find(
    (tt) => tt._id === selectedTimetableId
  )

  function _setPhaseFromTimetable(tt) {
    update({
      phaseFromStop: null,
      phaseFromTimetable: tt ? `${tt.modificationId}:${tt._id}` : null
    })
  }

  return (
    <Stack spacing={4} mb={4}>
      <Heading size='sm'>
        <span>Phasing </span>
        <a
          href='http://docs.analysis.conveyal.com/en/latest/edit-scenario/phasing.html'
          rel='noopener noreferrer'
          target='_blank'
          title='Learn more about phasing'
        >
          <Icon icon={faInfoCircle} />
        </a>
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
          onChange={(s) => update({phaseAtStop: get(s, 'stop_id')})}
          options={modificationStops}
          placeholder={message('phasing.atStop')}
          value={modificationStops.find(
            (s) => s.stop_id === timetable.phaseAtStop
          )}
        />
      </FormControl>
      {disabled && <Alert status='info'>{message('phasing.disabled')}</Alert>}
      {timetable.phaseAtStop && (
        <>
          <FormControl>
            <FormLabel htmlFor='phaseFromTimetable'>
              {message('phasing.fromTimetable')}
            </FormLabel>
            <Select
              inputId='phaseFromTimetable'
              isClearable
              isDisabled={disabled}
              name={message('phasing.fromTimetable')}
              getOptionLabel={(t) =>
                `${get(t, 'modificationName')}: ${timetableToString(t)}`
              }
              getOptionValue={(t) =>
                `${get(t, 'modificationId')}:${get(t, '_id')}`
              }
              onChange={_setPhaseFromTimetable}
              options={availableTimetables}
              placeholder={message('phasing.fromTimetable')}
              value={selectedTimetable}
            />
          </FormControl>
          {timetable.phaseFromTimetable &&
            (selectedTimetable ? (
              <>
                {selectedTimetable.headwaySecs !== timetable.headwaySecs && (
                  <Alert status='error'>
                    {message('phasing.headwayMismatchWarning', {
                      selectedTimetableHeadway:
                        selectedTimetable.headwaySecs / 60
                    })}
                  </Alert>
                )}
                {get(selectedPhaseFromTimetableStops, 'length') > 0 ? (
                  <FormControl>
                    <FormLabel htmlFor='phaseFromStop'>
                      {message('phasing.fromStop')}
                    </FormLabel>
                    <Select
                      inputId='phaseFromStop'
                      getOptionLabel={getStopName}
                      getOptionValue={getStopId}
                      name={message('phasing.fromStop')}
                      onChange={(s) =>
                        update({phaseFromStop: get(s, 'stop_id')})
                      }
                      options={selectedPhaseFromTimetableStops}
                      placeholder={message('phasing.fromStop')}
                      value={selectedPhaseFromTimetableStops.find(
                        (s) => s.stop_id === timetable.phaseFromStop
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
              </>
            ) : (
              <Alert status='error'>
                <strong>Selected timetable no longer exists.</strong> Please
                clear or change your phasing options or there will be errors
                during analysis.
              </Alert>
            ))}
        </>
      )}
    </Stack>
  )
}
