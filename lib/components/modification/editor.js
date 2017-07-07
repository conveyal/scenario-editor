// @flow
import React, {Component} from 'react'

import {Button} from '../buttons'
import {
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from '../../constants'
import AddTripPattern from '../../containers/add-trip-pattern'
import AdjustDwellTime from '../../containers/adjust-dwell-time'
import AdjustSpeed from '../../containers/adjust-speed'
import ConvertToFrequency from '../../containers/convert-to-frequency'
import RemoveStops from '../../containers/remove-stops'
import RemoveTrips from '../../containers/remove-trips'
import Reroute from '../../containers/reroute'
import Icon from '../icon'
import {Checkbox, Group, Text, TextArea} from '../input'
import {Body as PanelBody} from '../panel'
import messages from '../../utils/messages'

import type {MapState, Modification} from '../../types'

type Props = {
  allVariants: string[],
  bundleId: string,
  isLoaded: boolean,
  modification: Modification,
  copyModification(): void,
  removeModification(): void,
  setMapState(MapState): void,
  setModificationName(string): void,
  setModificationVariants(boolean[]): void,
  update(any): void
}

type State = {
  showDescription: boolean
}

const modificationTypeToComponentMap = {
  [ADD_TRIP_PATTERN]: AddTripPattern,
  [ADJUST_DWELL_TIME]: AdjustDwellTime,
  [ADJUST_SPEED]: AdjustSpeed,
  [CONVERT_TO_FREQUENCY]: ConvertToFrequency,
  [REMOVE_STOPS]: RemoveStops,
  [REMOVE_TRIPS]: RemoveTrips,
  [REROUTE]: Reroute
}

export default class ModificationEditor extends Component<void, Props, State> {
  state = {
    showDescription: !!this.props.modification.description
  }

  _onNameChange = (e: Event & {currentTarget: HTMLInputElement}) => {
    this.props.setModificationName(e.currentTarget.value)
  }

  _onDescriptionChange = (e: Event & {currentTarget: HTMLInputElement}) => {
    this.props.update({description: e.currentTarget.value})
  }

  _onAddDescription = () => {
    this.setState({showDescription: true})
  }

  _remove = () => {
    if (window.confirm(messages.modification.deleteConfirmation)) {
      this.props.removeModification()
    }
  }

  _setVariant = (variantIndex: number, active: boolean) => {
    const {variants} = this.props.modification

    // this is coming from a bitset on the Java side so may be of varying length
    for (let i = 0; i < variants.length; i++) {
      if (variants[i] === undefined) variants[i] = false
    }

    variants[variantIndex] = active

    this.props.setModificationVariants([...variants])
  }

  render () {
    const {
      allVariants,
      copyModification,
      isLoaded,
      modification,
      setMapState,
      update
    } = this.props
    const {showDescription} = this.state
    const name = modification.name

    if (!isLoaded) {
      return <div className='ModificationDock'>
        <div className='ModificationDockTitle'>{name}</div>
        <div className='InnerDock'>
          <PanelBody>Loading...</PanelBody>
        </div>
      </div>
    }

    const Modification = modificationTypeToComponentMap[modification.type]

    return (
      <div className='ModificationDock'>
        <div className='ModificationDockTitle'>
          {name}

          <a
            className='pull-right'
            onClick={this._remove}
            tabIndex={0}
            title={messages.modification.deleteModification}
            ><Icon type='trash' />
          </a>
          <a
            className='pull-right'
            onClick={copyModification}
            tabIndex={0}
            title={messages.modification.copyModification}
            ><Icon type='copy' />
          </a>
        </div>
        <div className='InnerDock'>
          <PanelBody>
            <Text
              name='Modification Name'
              onChange={this._onNameChange}
              value={name}
              />

            {showDescription && <TextArea
              value={modification.description}
              onChange={this._onDescriptionChange}
              label={messages.modification.description}
            />}

            {!showDescription && <Group>
              <Button
                block
                style='info'
                onClick={this._onAddDescription} >
                <Icon type='pencil' /> {messages.modification.addDescription}
              </Button>
            </Group>}

            <Modification
              modification={modification}
              setMapState={setMapState}
              update={update}
              />

            <Variants
              activeVariants={modification.variants}
              allVariants={allVariants}
              modificationId={modification.id}
              setVariant={this._setVariant}
              />
          </PanelBody>
        </div>
      </div>
    )
  }
}

function Variants ({
  activeVariants,
  allVariants,
  modificationId,
  setVariant
}) {
  return <div>
    <legend>Active in variants</legend>
    <div className='form-inline'>
      {allVariants.map((v, i) => <Checkbox
        checked={activeVariants[i]}
        label={i + 1}
        key={`variant-${i}-modification-${modificationId}`}
        onChange={(e) => setVariant(i, e.target.checked)}
        title={v}
        />
      )}
    </div>
  </div>
}
