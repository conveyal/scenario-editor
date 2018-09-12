// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import {Application, Dock, Title} from '../base'
import {Button} from '../buttons'
import {IconLink} from '../link'
import AddTripPattern from '../../containers/add-trip-pattern'
import AdjustDwellTime from '../../containers/adjust-dwell-time'
import AdjustSpeed from '../../containers/adjust-speed'
import ConvertToFrequency from '../../containers/convert-to-frequency'
import LabelLayer from '../map/label-layer'
import ModificationsMap from '../../containers/modifications-map'
import RemoveStops from '../../containers/remove-stops'
import RemoveTrips from '../../containers/remove-trips'
import Reroute from '../../containers/reroute'
import {Checkbox, Group, Text, TextArea} from '../input'
import messages from '../../utils/messages'
import type {MapState, Modification} from '../../types'

// Also autosaves on exit
const AUTOSAVE_EVERY_MS = 10 * 1000

type Props = {
  allVariants: string[],
  clearActive: () => void,
  copyModification: () => void,
  feedIsLoaded: boolean,
  modification?: Modification,
  modificationId: string,

  projectId: string,
  regionId: string,
  removeModification: () => void,
  setActive: () => void,
  setMapState: (MapState) => void,
  update: (modification: any) => void,
  updateAndRetrieveFeedData: (modification: any) => void,
  updateLocally: (modification: any) => void
}

const modificationTypeToComponentMap = {
  'add-trip-pattern': AddTripPattern,
  'adjust-dwell-time': AdjustDwellTime,
  'adjust-speed': AdjustSpeed,
  'convert-to-frequency': ConvertToFrequency,
  'remove-stops': RemoveStops,
  'remove-trips': RemoveTrips,
  reroute: Reroute
}

const ModificationType = (props) => {
  const M = modificationTypeToComponentMap[props.type]
  return <M {...props} />
}

export default class ModificationEditor extends React.Component<Props> {
  state = {
    showDescription: !!(this.props.modification && this.props.modification.description),
    showEditName: false
  }

  _savedChangesInterval: number
  _unsavedChanges = false

  componentDidMount () {
    window.addEventListener('beforeunload', this._checkForUnsavedChanges)
    this.props.setActive()
    this._savedChangesInterval = setInterval(this._saveChanges, AUTOSAVE_EVERY_MS)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this._checkForUnsavedChanges)
    clearInterval(this._savedChangesInterval)
    this._saveChanges()
    this.props.clearActive()
  }

  _checkForUnsavedChanges = (event: Event & {returnValue: string}) => {
    if (this._unsavedChanges) {
      this._saveChanges()
      event.returnValue = 'Committing unsaved changes to modification'
    }
  }

  _onNameChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateLocally({name: e.target.value})
  }

  _onDescriptionChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateLocally({description: e.target.value})
  }

  _onAddDescription = () => {
    this.setState({showDescription: true})
  }

  _remove = () => {
    if (window.confirm(messages.modification.deleteConfirmation)) {
      this.props.removeModification()
    }
  }

  _removeFeed = () => {
    const {modification} = this.props
    if (modification) {
      const update: any = {feed: null}
      if (modification.hasOwnProperty('routes')) update.routes = null
      if (modification.hasOwnProperty('stops')) update.stops = null
      if (modification.hasOwnProperty('trips')) update.trips = null
      if (modification.hasOwnProperty('fromStop')) update.fromStop = null
      if (modification.hasOwnProperty('toStop')) update.toStop = null
      this._updateAndRetrieveFeedData(update)
    }
  }

  _saveChanges = () => {
    if (this._unsavedChanges) {
      this._unsavedChanges = false
      this.props.update(this.props.modification)
    }
  }

  _setVariant = (variantIndex: number, active: boolean) => {
    const {modification} = this.props
    if (modification) {
      const {variants} = modification

      // this is coming from a bitset on the Java side so may be of varying length
      for (let i = 0; i < variants.length; i++) {
        if (variants[i] === undefined) variants[i] = false
      }

      variants[variantIndex] = active

      this._updateLocally({
        variants: [...variants]
      })
    }
  }

  _showEditModificationName = () => this.setState({showEditName: true})

  _updateAndRetrieveFeedData = (properties: any) => {
    this._unsavedChanges = false
    this.props.updateAndRetrieveFeedData({
      ...this.props.modification,
      ...properties
    })
  }

  _updateLocally = (properties: any) => {
    this._unsavedChanges = true
    this.props.updateLocally({...this.props.modification, ...properties})
  }

  _map = () =>
    <g>
      <LabelLayer />
      <ModificationsMap />
    </g>

  render () {
    const {
      allVariants,
      copyModification,
      feedIsLoaded,
      modification,
      projectId,
      regionId,
      setMapState
    } = this.props
    const {showDescription, showEditName} = this.state
    return (
      <Application map={this._map}>
        <Title>
          <IconLink
            title='Modifications'
            to={`/regions/${regionId}/projects/${projectId}/modifications`}
            type='chevron-left'
          />
          {modification ? modification.name : 'Loading...'}

          <IconLink
            className='pull-right'
            onClick={this._remove}
            title={messages.modification.deleteModification}
            type='trash'
          />
          <IconLink
            className='pull-right'
            onClick={copyModification}
            title={messages.modification.copyModification}
            type='copy'
          />
          <IconLink
            className='pull-right'
            onClick={this._showEditModificationName}
            title={messages.modification.editModificationName}
            type='pencil'
          />
        </Title>
        <Dock>
          {feedIsLoaded
            ? modification
              ? <div>
                {showEditName &&
                  <Text
                    name='Modification Name'
                    onChange={this._onNameChange}
                    value={modification.name}
                  />}

                {showDescription &&
                <TextArea
                  value={modification.description}
                  onChange={this._onDescriptionChange}
                  label={messages.modification.description}
                />}

                {!showDescription &&
                <Group>
                  <Button block style='info' onClick={this._onAddDescription}>
                    <Icon type='pencil' />
                    {' '}
                    {messages.modification.addDescription}
                  </Button>
                </Group>}

                <ModificationType
                  modification={modification}
                  setMapState={setMapState}
                  type={modification.type}
                  update={this._updateLocally}
                  updateAndRetrieveFeedData={this._updateAndRetrieveFeedData}
                />

                <Variants
                  activeVariants={modification.variants}
                  allVariants={allVariants}
                  modificationId={modification._id}
                  setVariant={this._setVariant}
                />
              </div>
              : <p>Loading modification...</p>
            : <div>
              <p>Loading modification feed...</p>
              <p>{messages.modification.clearBundleInfo}</p>
              <Button block style='warning' onClick={this._removeFeed}><Icon type='times' /> {messages.modification.clearBundleConfirm}</Button>
            </div>}
        </Dock>
      </Application>
    )
  }
}

function Variants ({activeVariants, allVariants, modificationId, setVariant}) {
  return (
    <div>
      <h5>{messages.variant.activeIn}</h5>
      <div className='form-inline'>
        {allVariants.map((v, i) => (
          <Checkbox
            checked={activeVariants[i]}
            label={i + 1}
            key={`variant-${i}-modification-${modificationId}`}
            onChange={e => setVariant(i, e.target.checked)}
            title={v}
          />
        ))}
      </div>
    </div>
  )
}
