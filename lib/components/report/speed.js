// @flow
import React, {PureComponent} from 'react'

import messages from '../../utils/messages'

/** conversions from km/h to appropriate units */
const conversions = {
  kmh: 1,
  mph: 1 / 1.609,
  ff: 4.907 * 24 * 14 // furlongs per fortnight
}

/**
 * Render speed in appropriate units
 */
export default class Speed extends PureComponent<Props, State> {
  render () {
    const {kmh, units = ['kmh', 'mph']} = this.props
    const main = `${Math.round(kmh * conversions[units[0]] * 10) / 10} ${messages.report.units[units[0]]}`

    const addl = units
      .slice(1)
      .map(
        unit =>
          `${Math.round(kmh * conversions[unit] * 10) / 10} ${messages.report.units[unit]}`
      )
      .join(',')

    return <span>{`${main} (${addl})`}</span>
  }
}
