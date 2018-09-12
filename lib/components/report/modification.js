// @flow
import React, {Component} from 'react'

import messages from '../../utils/messages'
import {
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from '../../constants'
import type {FeedsById, Modification} from '../../types'

import AdjustFrequency from './adjust-frequency'
import AddTrips from './add-trips'
import RemoveTrips from './remove-trips'
import RemoveStops from './remove-stops'
import Reroute from './reroute'
import AdjustDwellTime from './adjust-dwell-time'
import AdjustSpeed from './adjust-speed'

type Props = {
  feedsById: FeedsById,
  index: number,
  modification: Modification,
  total: number
}

export default class ModificationReport extends Component<Props> {
  render () {
    const {modification, feedsById, index, total} = this.props

    if (
      modification.type !== ADD_TRIP_PATTERN &&
      feedsById[modification.feed] === undefined
    ) {
      return <div />
    }

    return (
      <div className='Report-Modification'>
        <h3>
          ({index} / {total}){' '}
          {messages.modificationType[modification.type] || modification.type}
        </h3>
        <h2>
          {modification.name}
        </h2>

        {modification.description &&
          <i>
            {modification.description}
          </i>}

        {modification.type === CONVERT_TO_FREQUENCY &&
          <AdjustFrequency {...this.props} />}
        {modification.type === ADD_TRIP_PATTERN && <AddTrips {...this.props} />}
        {modification.type === REMOVE_TRIPS && <RemoveTrips {...this.props} />}
        {modification.type === REMOVE_STOPS && <RemoveStops {...this.props} />}
        {modification.type === REROUTE && <Reroute {...this.props} />}
        {modification.type === ADJUST_DWELL_TIME &&
          <AdjustDwellTime {...this.props} />}
        {modification.type === ADJUST_SPEED && <AdjustSpeed {...this.props} />}
      </div>
    )
  }
}
