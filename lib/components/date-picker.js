// @flow
import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import DateTime from 'react-datetime'

let datePickerCount = 0
/**
 * Pick a date in ISO format (2016-12-16).
 * This class is just a wrapper around an input for now, but in the future could wrap a
 */
export default class DatePicker extends PureComponent<Props, State> {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  componentWillMount () {
    datePickerCount++
  }

  componentWillUnmount () {
    datePickerCount--
  }

  _onChange = (date: Date) => {
    // grab just the date portion of the ISO
    // ISO is in UTC, see comment below
    this.props.onChange(date.toISOString().split('T')[0])
  }

  render () {
    const {value, ...rest} = this.props
    return (
      <DateTime
        type='date'
        value={new Date(value)}
        timeFormat={false}
        inputProps={{id: `date-picker-${datePickerCount}`}}
        utc // because new Date('2016-12-12') yields a date at midnight UTC
        {...rest}
        onChange={this._onChange}
      />
    )
  }
}
