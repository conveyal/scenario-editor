import React from 'react'

import * as C from 'lib/constants'

import AddStreets from './add-streets'
import AddTripPattern from './add-trip-pattern'
import AdjustDwellTime from './adjust-dwell-time'
import AdjustSpeed from './adjust-speed'
import ConvertToFrequency from './convert-to-frequency'
import ModifyStreets from './modify-streets'
import RemoveStops from './remove-stops'
import RemoveTrips from './remove-trips'
import Reroute from './reroute'

/**
 * Render the modification component for the given type.
 */
export default function Type(p) {
  switch (p.type) {
    case C.ADD_STREETS:
      return <AddStreets {...p} />
    case C.ADD_TRIP_PATTERN:
      return <AddTripPattern {...p} />
    case C.ADJUST_DWELL_TIME:
      return <AdjustDwellTime {...p} />
    case C.ADJUST_SPEED:
      return <AdjustSpeed {...p} />
    case C.CONVERT_TO_FREQUENCY:
      return <ConvertToFrequency {...p} />
    case C.MODIFY_STREETS:
      return <ModifyStreets {...p} />
    case C.REMOVE_STOPS:
      return <RemoveStops {...p} />
    case C.REMOVE_TRIPS:
      return <RemoveTrips {...p} />
    case C.REROUTE:
      return <Reroute {...p} />
    default:
      return null
  }
}
