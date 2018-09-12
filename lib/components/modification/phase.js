// @flow
import message from '@conveyal/woonerf/message'
import React, {PureComponent} from 'react'
import Select from 'react-select'

import {Group as FormGroup} from '../input'
import MinutesSeconds from '../minutes-seconds'
import {toString as timetableToString} from '../../utils/timetable'
import type {ClearableReactSelectResult, GTFSStop, Timetable} from '../../types'

type Props = {
  availableTimetables: Timetable[],
  disabled: boolean,
  modificationStops: GTFSStop[],
  phaseAtStop: null | string,
  phaseFromStop: null | string,
  phaseFromTimetable: null | string,
  phaseSeconds: number,
  selectedPhaseFromTimetableStops: GTFSStop[],
  timetableHeadway: number,

  // actions
  update: (any) => void
}

type State = {
  selectedTimetable: void | Timetable
}

export default class Phase extends PureComponent<void, Props, State> {
  state = {
    selectedTimetable: getSelectedTimetable(this.props)
  }

  componentWillReceiveProps (nextProps: Props) {
    const selectedTimetable = getSelectedTimetable(nextProps)
    this.setState({selectedTimetable})
    if (nextProps.phaseFromTimetable && !selectedTimetable) {
      this._setPhaseFromTimetable(null) // timetable does not exist
    }
  }

  componentDidMount () {
    if (this.props.phaseFromTimetable && !this.state.selectedTimetable) {
      this._setPhaseFromTimetable(null)
    }
  }

  _setPhaseAtStop = (stop: ClearableReactSelectResult) => {
    this.props.update({phaseAtStop: stop && stop.value})
  }

  _setPhaseFromTimetable = (timetable: ClearableReactSelectResult) => {
    this.props.update({
      phaseFromTimetable: timetable && timetable.value,
      phaseFromStop: null
    })
  }

  _setPhaseFromStop = (stop: ClearableReactSelectResult) => {
    this.props.update({phaseFromStop: stop && stop.value})
  }

  _setPhaseSeconds = (phaseSeconds: number) => {
    this.props.update({phaseSeconds})
  }

  render () {
    const {
      availableTimetables,
      disabled,
      phaseAtStop,
      phaseFromStop,
      phaseFromTimetable,
      phaseSeconds,
      modificationStops,
      selectedPhaseFromTimetableStops,
      timetableHeadway
    } = this.props
    const {selectedTimetable} = this.state
    return (
      <div>
        <FormGroup label={message('phasing.atStop')}>
          <Select
            disabled={disabled}
            name={message('phasing.atStop')}
            onChange={this._setPhaseAtStop}
            options={modificationStops.map(stop => ({
              value: stop.stop_id,
              label: stop.stop_name
            }))}
            placeholder={message('phasing.atStop')}
            value={phaseAtStop}
          />
        </FormGroup>
        {disabled &&
          <div className='alert alert-info' role='alert'>
            {message('phasing.disabled')}
          </div>}
        {phaseAtStop &&
          <div>
            <FormGroup label={message('phasing.fromTimetable')}>
              <Select
                name={message('phasing.fromTimetable')}
                onChange={this._setPhaseFromTimetable}
                options={availableTimetables.map(timetable => ({
                  value: `${timetable.modificationId}:${timetable._id}`,
                  label: `${timetable.modificationName}: ${timetableToString(timetable)}`
                }))}
                placeholder={message('phasing.fromTimetable')}
                value={phaseFromTimetable}
              />
            </FormGroup>
            {phaseFromTimetable &&
              selectedTimetable &&
              <div>
                {selectedTimetable.headwaySecs !== timetableHeadway &&
                  <div className='alert alert-danger' role='alert'>
                    {message('phasing.headwayMismatchWarning', {
                      selectedTimetableHeadway: selectedTimetable.headwaySecs /
                        60
                    })}
                  </div>}
                {selectedPhaseFromTimetableStops &&
                  selectedPhaseFromTimetableStops.length > 0
                  ? <FormGroup label={message('phasing.fromStop')}>
                    <Select
                      name={message('phasing.fromStop')}
                      onChange={this._setPhaseFromStop}
                      options={selectedPhaseFromTimetableStops.map(stop => ({
                        value: stop.stop_id,
                        label: stop.stop_name
                      }))}
                      placeholder={message('phasing.fromStop')}
                      value={phaseFromStop}
                    />
                  </FormGroup>
                  : <div className='alert alert-danger' role='alert'>
                    {message('phasing.noAvailableStopsWarning')}
                  </div>}
                {phaseFromStop &&
                  <MinutesSeconds
                    label={message('phasing.minutes')}
                    onChange={this._setPhaseSeconds}
                    seconds={phaseSeconds}
                  />}
              </div>}
          </div>}
      </div>
    )
  }
}

function getSelectedTimetable ({availableTimetables, phaseFromTimetable}): void | Timetable {
  return availableTimetables.find(
    tt => phaseFromTimetable && tt._id === phaseFromTimetable.split(':')[1]
  )
}
