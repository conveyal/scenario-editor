import React, {Component, PropTypes} from 'react'

import AddTripPattern from './add-trip-pattern'
import AdjustDwellTime from './adjust-dwell-time'
import AdjustSpeed from './adjust-speed'
import {Button} from '../buttons'
import ConvertToFrequency from './convert-to-frequency'
import Icon from '../icon'
import {Checkbox, Text} from '../input'
import {Body as PanelBody} from '../panel'
import RemoveStops from './remove-stops'
import RemoveTrips from './remove-trips'
import Reroute from './reroute'
import getStops from '../../utils/get-stops'
import messages from '../../utils/messages'
import * as types from '../../utils/modification-types'

export default class ModificationEditor extends Component {
  static propTypes = {
    allVariants: PropTypes.array.isRequired,
    bundleId: PropTypes.string.isRequired,
    modification: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    remove: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    variants: PropTypes.array.isRequired,

    // TODO: verify these are required for sub-components and remove if not needed
    feeds: PropTypes.array.isRequired,
    feedsById: PropTypes.object.isRequired,
    mapState: PropTypes.object.isRequired,
    setActiveTrips: PropTypes.func.isRequired,
    setMapState: PropTypes.func.isRequired
  }

  _onNameChange = (e) => {
    this._update({name: e.target.value})
  }

  _remove = () => {
    if (window.confirm(messages.modification.deleteConfirmation)) {
      this.props.remove()
    }
  }

  _replaceModification = (modification) => {
    const {bundleId, replace} = this.props
    replace({bundleId, modification})
  }

  _update = (properties) => {
    const {bundleId, modification, replace} = this.props
    replace({
      bundleId,
      modification: {
        ...modification,
        ...properties
      }
    })
  }

  setVariant (variantIndex, active) {
    const {variants} = this.props

    // this is coming from a bitset on the Java side so may be of varying length
    for (let i = 0; i < active; i++) {
      if (variants[i] === undefined) variants[i] = false
    }

    variants[variantIndex] = active

    this._update({variants: [...variants]})
  }

  render () {
    const {allVariants, feeds, feedsById, modification, mapState, name, setActiveTrips, setMapState, type, variants} = this.props
    const props = {
      feeds,
      feedsById,
      mapState,
      modification,
      replaceModification: this._replaceModification,
      setActiveTrips,
      setMapState,
      update: this._update
    }

    if (modification.segments) {
      props.stops = getStops(modification.segments)
      props.lastStopDistanceFromStart = props.stops.length > 0
        ? props.stops.slice(-1)[0].distanceFromStart
        : 0

      props.totalTravelTimeMinutes = getTravelTimeMinutes(props)
    }

    const ModificationType = getComponentForType(type)
    return (
      <div className='ModificationDock'>
        <div className='ModificationDockTitle'>{name}</div>
        <div className='InnerDock'>
          <PanelBody>
            <Text
              name='Modification Name'
              onChange={this._onNameChange}
              value={name}
              />

            <ModificationType {...props} />

            <br />
            <legend>Active in variants</legend>
            <div className='form-inline'>
              {allVariants.map((v, i) => <Checkbox
                checked={variants[i]}
                label={i + 1}
                key={`variant-${i}-modification-${modification.id}`}
                onChange={(e) => this.setVariant(i, e.target.checked)}
                title={v}
                />
              )}
              <Button
                block
                className='pull-right'
                onClick={this._remove}
                style='danger'
                title='Delete Modification'
                ><Icon type='close' /> Delete Modification
              </Button>
            </div>
          </PanelBody>
        </div>
      </div>
    )
  }
}

function getTravelTimeMinutes ({lastStopDistanceFromStart, modification, stops}) {
  const nStops = stops.length

  let travelTime = 0
  if (nStops > 0) {
    travelTime = lastStopDistanceFromStart / 1000 / modification.speed * 60
    // add the dwell times
    const dwellMinutes = modification.dwell / 60
    travelTime += nStops * dwellMinutes

    // don't include dwell time at first and last stop of reroute
    if (!modification.fromStop) travelTime -= dwellMinutes
    if (!modification.toStop) travelTime -= dwellMinutes
  }

  return travelTime
}

function getComponentForType (type) {
  switch (type) {
    case types.ADD_TRIP_PATTERN:
      return AddTripPattern
    case types.REMOVE_TRIPS:
      return RemoveTrips
    case types.REMOVE_STOPS:
      return RemoveStops
    case types.ADJUST_SPEED:
      return AdjustSpeed
    case types.ADJUST_DWELL_TIME:
      return AdjustDwellTime
    case types.CONVERT_TO_FREQUENCY:
      return ConvertToFrequency
    case types.ADD_STOPS:
    case types.REROUTE:
      return Reroute
  }
}
