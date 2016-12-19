/** display an add trip pattern modification */

import React, {PropTypes} from 'react'

import {Button} from '../buttons'
import DeepEqual from '../deep-equal'
import Icon from '../icon'
import {Checkbox, Number} from '../input'
import Timetables from './timetables'
import {ADD_TRIP_PATTERN} from '../../utils/modification-types'
import messages from '../../utils/messages'

const DEFAULT_SPACING = 400

export default class AddTripPattern extends DeepEqual {
  static propTypes = {
    lastStopDistanceFromStart: PropTypes.number.isRequired,
    mapState: PropTypes.object.isRequired,
    modification: PropTypes.object.isRequired,
    replaceModification: PropTypes.func.isRequired,
    setMapState: PropTypes.func,
    stops: PropTypes.array.isRequired,
    update: PropTypes.func.isRequired
  }

  state = getStateFromProps(this.props)

  componentWillReceiveProps (newProps) {
    this.setState({...this.state, ...getStateFromProps(newProps)})
  }

  /** edit this modification on the map */
  editOnMap = () => {
    this.props.setMapState({
      followRoad: this.state.followRoad,
      state: ADD_TRIP_PATTERN,
      extendFromEnd: this.state.extendFromEnd,
      allowExtend: true,
      modificationId: this.props.modification.id
    })
  }

  stopEditingOnMap = () => {
    this.props.setMapState({
      state: null,
      modificationId: null
    })
  }

  onExtendFromEndChange = (e) => {
    this.props.setMapState({
      followRoad: this.state.followRoad,
      state: ADD_TRIP_PATTERN,
      extendFromEnd: e.target.checked,
      allowExtend: true,
      modificationId: this.props.modification.id
    })
  }

  onFollowRoadChange = (e) => {
    this.props.setMapState({
      allowExtend: true,
      extendFromEnd: this.state.extendFromEnd,
      followRoad: e.target.checked,
      state: ADD_TRIP_PATTERN,
      modificationId: this.props.modification.id
    })
  }

  /** toggle whether a pattern is bidirectional */
  onBidirectionalChange = (e) => {
    this.props.update({bidirectional: e.target.checked})
  }

  /** toggle whether stops should be created automatically */
  onAutoCreateStopsChange = (e) => {
    const {modification, update} = this.props
    const spacing = e.target.checked ? 400 : 0
    this.setState({...this.state, spacing})

    const segments = modification.segments
      .map((segment) => Object.assign({}, segment, {spacing})) // TODO store spacing in modification separately from per-segment spacing?

    update({segments})
  }

  /** set stop spacing */
  onStopSpacingChange = (e) => {
    const {modification, update} = this.props
    const {segments} = modification
    const spacing = parseInt(e.target.value, 10)
    this.setState({...this.state, spacing})
    if (spacing !== null && !isNaN(spacing) && spacing >= 50) {
      // only set stop spacing if current spacing is not zero
      if (segments.length > 0 && segments[0].spacing > 0) {
        update({segments: segments.map((segment) => Object.assign({}, segment, {spacing}))})
      }
    }
  }

  render () {
    const {lastStopDistanceFromStart, modification, mapState, stops, update} = this.props
    const {extendFromEnd, followRoad} = this.state
    // not using state here as otherwise checkbox would toggle on and off as you're editing the stop spacing
    const autoCreateStops = modification.segments.length > 0 ? modification.segments[0].spacing > 0 : true
    const isEditing = mapState.modificationId === modification.id
    return (
      <div>
        {!isEditing
          ? <Button
            block
            onClick={this.editOnMap}
            style='warning'
            ><Icon type='pencil' /> Edit route geometry
          </Button>
          : <Button
            block
            onClick={this.stopEditingOnMap}
            style='warning'
            ><Icon type='times-circle' /> Stop editing
          </Button>}

        {isEditing &&
          <Checkbox
            defaultChecked={extendFromEnd}
            label={messages.transitEditor.extendFromEnd}
            onChange={this.onExtendFromEndChange}
            />}

        {isEditing &&
          <Checkbox
            defaultChecked={followRoad}
            label={messages.transitEditor.followRoad}
            onChange={this.onFollowRoadChange}
            />}

        <Checkbox
          defaultChecked={autoCreateStops}
          label={messages.transitEditor.autoCreateStops}
          onChange={this.onAutoCreateStopsChange}
          />

        {autoCreateStops &&
          <Number
            value={this.state.spacing}
            label={messages.transitEditor.stopSpacingMeters}
            onChange={this.onStopSpacingChange}
            />}

        <Checkbox
          checked={modification.bidirectional}
          label='Bidirectional'
          onChange={this.onBidirectionalChange}
          />

        <Timetables
          distance={lastStopDistanceFromStart}
          timetables={modification.timetables}
          segments={modification.segments}
          stops={stops}
          update={update}
          />
      </div>
    )
  }
}

function getStateFromProps ({
  mapState,
  modification
}) {
  return {
    followRoad: mapState.followRoad,
    spacing: modification.segments.length > 0 ? modification.segments[0].spacing : DEFAULT_SPACING,
    extendFromEnd: mapState && mapState.modificationId === modification.id ? mapState.extendFromEnd : true
  }
}
