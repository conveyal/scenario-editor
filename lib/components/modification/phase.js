import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'

import message from 'lib/message'
import {toString as timetableToString} from 'lib/utils/timetable'

import H5 from '../h5'
import Icon from '../icon'
import Select from '../select'
import {Group as FormGroup} from '../input'
import MinutesSeconds from '../minutes-seconds'

export default function Phase(p) {
  const {phaseFromTimetable, update} = p
  const selectedTimetableId = (phaseFromTimetable || '').split(':')[1]
  const selectedTimetable = p.availableTimetables.find(
    tt => tt._id === selectedTimetableId
  )

  function _setPhaseFromTimetable(tt) {
    update({
      phaseFromStop: null,
      phaseFromTimetable: tt ? `${tt.modificationId}:${tt._id}` : null
    })
  }

  return (
    <>
      <H5>
        <span>Phasing </span>
        <a
          href='http://docs.analysis.conveyal.com/en/latest/edit-scenario/phasing.html'
          rel='noopener noreferrer'
          target='_blank'
          title='Learn more about phasing'
        >
          <Icon icon={faInfoCircle} />
        </a>
      </H5>
      <FormGroup label={message('phasing.atStop')}>
        <Select
          isClearable
          isDisabled={p.disabled}
          name={message('phasing.atStop')}
          getOptionLabel={s => s.stop_name}
          getOptionValue={s => s.stop_id}
          onChange={s => update({phaseAtStop: get(s, 'stop_id')})}
          options={p.modificationStops}
          placeholder={message('phasing.atStop')}
          value={p.modificationStops.find(s => s.stop_id === p.phaseAtStop)}
        />
      </FormGroup>
      {p.disabled && (
        <div className='alert alert-info' role='alert'>
          {message('phasing.disabled')}
        </div>
      )}
      {p.phaseAtStop && (
        <>
          <FormGroup label={message('phasing.fromTimetable')}>
            <Select
              isClearable
              isDisabled={p.disabled}
              name={message('phasing.fromTimetable')}
              getOptionLabel={t =>
                `${t.modificationName}: ${timetableToString(t)}`
              }
              getOptionValue={t => `${t.modificationId}:${t._id}`}
              onChange={_setPhaseFromTimetable}
              options={p.availableTimetables}
              placeholder={message('phasing.fromTimetable')}
              value={selectedTimetable}
            />
          </FormGroup>
          {p.phaseFromTimetable &&
            (selectedTimetable ? (
              <>
                {selectedTimetable.headwaySecs !== p.timetableHeadway && (
                  <div className='alert alert-danger' role='alert'>
                    {message('phasing.headwayMismatchWarning', {
                      selectedTimetableHeadway:
                        selectedTimetable.headwaySecs / 60
                    })}
                  </div>
                )}
                {get(p.selectedPhaseFromTimetableStops, 'length') > 0 ? (
                  <FormGroup label={message('phasing.fromStop')}>
                    <Select
                      getOptionLabel={s => s.stop_name}
                      getOptionValue={s => s.stop_id}
                      name={message('phasing.fromStop')}
                      onChange={s => update({phaseFromStop: get(s, 'stop_id')})}
                      options={p.selectedPhaseFromTimetableStops}
                      placeholder={message('phasing.fromStop')}
                      value={p.selectedPhaseFromTimetableStops.find(
                        s => s.stop_id === p.phaseFromStop
                      )}
                    />
                  </FormGroup>
                ) : (
                  <div className='alert alert-danger' role='alert'>
                    {message('phasing.noAvailableStopsWarning')}
                  </div>
                )}
                {p.phaseFromStop && (
                  <MinutesSeconds
                    label={message('phasing.minutes')}
                    onChange={phaseSeconds => update({phaseSeconds})}
                    seconds={p.phaseSeconds}
                  />
                )}
              </>
            ) : (
              <div className='alert alert-danger'>
                <strong>Selected timetable no longer exists.</strong> Please
                clear or change your phasing options or there will be errors
                during analysis.
              </div>
            ))}
        </>
      )}
    </>
  )
}
