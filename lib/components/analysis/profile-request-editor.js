// @flow

import React, {Component} from 'react'

import DatePicker from '../date-picker'
import R5Version from '../../modules/r5-version'
import messages from '../../utils/messages'
import TimePicker from '../time-picker'
import type {ProfileRequest} from '../../types'

import ModeSelector from './mode-selector'

type Props = {
  disabled: boolean,
  profileRequest: ProfileRequest,
  setProfileRequest: (profileRequestFields: any) => void
}

/** Edit the parameters of a profile request */
export default class ProfileRequestEditor extends Component<Props, State> {
  set (newFields: any) {
    this.props.setProfileRequest(newFields)
  }

  setFromTime = (fromTime: number) => this.set({fromTime: parseInt(fromTime)})
  setToTime = (toTime: number) => this.set({toTime: parseInt(toTime)})
  setDate = (date: string) => this.set({date})

  render () {
    const {disabled, profileRequest, setProfileRequest} = this.props
    const {date, fromTime, toTime} = profileRequest
    return (
      <div>
        <ModeSelector
          accessModes={profileRequest.accessModes}
          directModes={profileRequest.directModes}
          disabled={disabled}
          transitModes={profileRequest.transitModes}
          update={setProfileRequest}
        />
        <div className='row'>
          <div className='form-group col-xs-4'>
            <label htmlFor={messages.analysis.date}>
              {messages.analysis.date}
            </label>
            <DatePicker
              disabled={disabled}
              value={date}
              onChange={this.setDate}
            />
          </div>
          <div className='col-xs-4'>
            <TimePicker
              disabled={disabled}
              label={messages.analysis.fromTime}
              value={fromTime}
              name='fromTime'
              onChange={this.setFromTime}
            />
          </div>
          <div className='col-xs-4'>
            <TimePicker
              disabled={disabled}
              label={messages.analysis.toTime}
              value={toTime}
              name='toTime'
              onChange={this.setToTime}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <R5Version.components.Selector />
          </div>
        </div>
      </div>
    )
  }
}
