// @flow
import React, {PureComponent} from 'react'

import messages from '../../utils/messages'

/**
 * Show days of service
 */
export default class DaysOfService extends PureComponent<Props, State> {
  render () {
    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    } = this.props
    return (
      <span>
        <span
          className={monday ? 'DaysOfService-active' : 'DaysOfService-inactive'}
          aria-hidden={!monday}
        >
          {messages.report.days.monday}
        </span>&nbsp;
        <span
          className={
            tuesday ? 'DaysOfService-active' : 'DaysOfService-inactive'
          }
          aria-hidden={!tuesday}
        >
          {messages.report.days.tuesday}
        </span>&nbsp;
        <span
          className={
            wednesday ? 'DaysOfService-active' : 'DaysOfService-inactive'
          }
          aria-hidden={!wednesday}
        >
          {messages.report.days.wednesday}
        </span>&nbsp;
        <span
          className={
            thursday ? 'DaysOfService-active' : 'DaysOfService-inactive'
          }
          aria-hidden={!thursday}
        >
          {messages.report.days.thursday}
        </span>&nbsp;
        <span
          className={friday ? 'DaysOfService-active' : 'DaysOfService-inactive'}
          aria-hidden={!friday}
        >
          {messages.report.days.friday}
        </span>&nbsp;
        <span
          className={
            saturday ? 'DaysOfService-active' : 'DaysOfService-inactive'
          }
          aria-hidden={!saturday}
        >
          {messages.report.days.saturday}
        </span>&nbsp;
        <span
          className={sunday ? 'DaysOfService-active' : 'DaysOfService-inactive'}
          aria-hidden={!sunday}
        >
          {messages.report.days.sunday}
        </span>
      </span>
    )
  }
}
