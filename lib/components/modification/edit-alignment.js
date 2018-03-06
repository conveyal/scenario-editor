// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React, {PureComponent} from 'react'

import {
  DEFAULT_STOP_SPACING_METERS,
  MINIMUM_STOP_SPACING,
  MAP_STATE_TRANSIT_EDITOR,
  REROUTE
} from '../../constants'
import colors from '../../constants/colors'

import {Button} from '../buttons'
import {Checkbox, Number} from '../input'

import type {MapState} from '../../types'

type Props = {
  extendFromEnd: boolean,
  mapState: MapState,
  modification: any,
  disabled: boolean,

  setMapState(any): void,
  update: (any) => void
}

type State = {
  allowExtend: boolean,
  createStopsAutomatically: boolean,
  followRoad: boolean,
  isEditing: boolean,
  spacing: number
}

export default class EditAlignment extends PureComponent {
  props: Props
  state: State

  state = getStateFromProps(this.props)

  componentWillReceiveProps (newProps: Props) {
    this.setState(getStateFromProps(newProps))
  }

  componentWillUnmount () {
    this._stopEditingOnMap()
  }

  /**
   * Edit this modification on the map
   */
  _editOnMap = () => {
    const {extendFromEnd, setMapState} = this.props
    const {allowExtend, followRoad, spacing} = this.state
    setMapState({
      allowExtend,
      extendFromEnd,
      followRoad,
      spacing,
      state: MAP_STATE_TRANSIT_EDITOR
    })
  }

  _stopEditingOnMap = () => {
    this.props.setMapState({
      state: null
    })
  }

  _updateMapState (props: any) {
    const {mapState, setMapState} = this.props
    if (mapState.state === MAP_STATE_TRANSIT_EDITOR) {
      setMapState({
        ...mapState,
        ...props
      })
    }
  }

  _onExtendFromEndChange = (e: Event & {target: HTMLInputElement}) => {
    this._updateMapState({extendFromEnd: e.target.checked})
  }

  _onFollowRoadChange = (e: Event & {target: HTMLInputElement}) => {
    this._updateMapState({followRoad: e.target.checked})
  }

  /**
   * Toggle whether a pattern is bidirectional.
   */
  _onBidirectionalChange = (e: Event & {target: HTMLInputElement}) => {
    this.props.update({bidirectional: e.target.checked})
  }

  /**
   * Toggle whether stops should be created automatically.
   */
  _onAutoCreateStopsChange = (e: Event & {target: HTMLInputElement}) => {
    const {mapState, modification, update} = this.props
    const spacing = e.target.checked ? DEFAULT_STOP_SPACING_METERS : 0

    if (mapState.state === MAP_STATE_TRANSIT_EDITOR) {
      this._updateMapState({spacing})
    } else {
      this.setState({
        createStopsAutomatically: spacing > 0,
        spacing
      })
    }

    if (modification.segments && modification.segments.length > 0) {
      update({
        segments: modification.segments.map(segment => ({...segment, spacing}))
      })
    }
  }

  /**
   * Set stop spacing
   */
  _onStopSpacingChange = (e: Event & {target: HTMLInputElement}) => {
    const {modification, update} = this.props
    const {segments} = modification
    const spacing = parseInt(e.target.value, 10)

    this._updateMapState({spacing})

    if (spacing !== null && !isNaN(spacing) && spacing >= 50) {
      // only set stop spacing if current spacing is not zero
      if (segments && segments.length > 0 && segments[0].spacing > 0) {
        update({segments: segments.map(segment => ({...segment, spacing}))})
      }
    }
  }

  render () {
    const {extendFromEnd, modification} = this.props
    const {
      createStopsAutomatically,
      followRoad,
      isEditing,
      spacing
    } = this.state
    const hasAnyPhasing =
      modification.timetables &&
      modification.timetables.findIndex(t => t.phaseAtStop != null) !== -1

    return (
      <div>
        {!isEditing
          ? <Button block
            onClick={this._editOnMap}
            style='warning'
            disabled={this.props.disabled ? this.props.disabled : false}>
            <Icon type='pencil' /> {message('transitEditor.startEdit')}
          </Button>
          : <Button block onClick={this._stopEditingOnMap} style='warning'>
            <Icon type='stop-circle' /> {message('transitEditor.stopEdit')}
          </Button>}

        <Checkbox
          defaultChecked={createStopsAutomatically}
          label={message('transitEditor.autoCreateStops')}
          onChange={this._onAutoCreateStopsChange}
        />

        {createStopsAutomatically &&
          <Number
            value={spacing}
            label={`${message('transitEditor.stopSpacingMeters')} (minimum is ${MINIMUM_STOP_SPACING})`}
            onChange={this._onStopSpacingChange}
            units='meters'
          />}

        {modification.type !== REROUTE &&
          <Checkbox
            checked={modification.bidirectional}
            label={message('transitEditor.bidirectional')}
            onChange={this._onBidirectionalChange}
            disabled={hasAnyPhasing}
          />}

        {hasAnyPhasing &&
          <div className='alert alert-info' role='alert'>
            {message('transitEditor.bidirectionalWarning')}
          </div>}

        {modification.type !== REROUTE &&
          isEditing &&
          <Checkbox
            defaultChecked={extendFromEnd}
            label={message('transitEditor.extendFromEnd')}
            onChange={this._onExtendFromEndChange}
          />}

        {isEditing &&
          <Checkbox
            defaultChecked={followRoad}
            label={message('transitEditor.followRoad')}
            onChange={this._onFollowRoadChange}
          />}

        {isEditing &&
          <section className='panel panel-default inner-panel'>
            <span
              className='panel-heading clearfix'
            >
              <strong>{message('transitEditor.instructionsTitle', 'Editing Instructions')}</strong>
            </span>
            <div className='panel-body'>
              <p>{message('transitEditor.instructions')}</p>
              <p><strong>Symbology</strong></p>
              <p><Icon type='circle-o' style={{color: colors.NEUTRAL, opacity: 0.5}} /> {message('transitEditor.existingStops')}</p>
              <p><Icon type='circle-o' style={{color: colors.ADDED}} /> {message('transitEditor.newStopDescription')}</p>
              <p><Icon type='circle-o' style={{color: colors.ADDED, opacity: 0.5}} /> {message('transitEditor.autocreatedStopDescription')}</p>
              <p><Icon type='circle-o' style={{color: colors.NEUTRAL}} /> {message('transitEditor.snappedStopDescription')}</p>
              <span><Icon type='circle' style={{color: colors.ADDED}} /> {message('transitEditor.controlPointDescription')}</span>
            </div>
          </section>}
      </div>
    )
  }
}

/**
  * Extract current stop spacing from a modification
  */
function getStateFromProps (props): State {
  const {mapState, modification} = props
  const spacing = modification.segments && modification.segments.length > 0
    ? modification.segments[0].spacing
    : 0

  return {
    allowExtend: modification.toStop == null || modification.fromStop == null,
    createStopsAutomatically: spacing > 0,
    followRoad: !!mapState.followRoad,
    isEditing: mapState.state === MAP_STATE_TRANSIT_EDITOR,
    spacing
  }
}
