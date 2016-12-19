/** reroute an existing line. Takes a start and end stop ID, and replaces all stops between those with the specified routing/set of stops */

import React, {Component, PropTypes} from 'react'

import {Button} from '../buttons'
import Icon from '../icon'
import {Group, Number, Checkbox} from '../input'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import messages from '../../utils/messages'
import {ADD_STOPS, SINGLE_STOP_SELECTION} from '../scenario-map/state'

export default class Reroute extends Component {
  static propTypes = {
    feeds: PropTypes.array.isRequired,
    feedsById: PropTypes.object.isRequired,
    lastStopDistanceFromStart: PropTypes.number.isRequired,
    modification: PropTypes.object.isRequired,
    mapState: PropTypes.object.isRequired,
    setMapState: PropTypes.func.isRequired,
    stops: PropTypes.array.isRequired,
    totalTravelTimeMinutes: PropTypes.number.isRequired,
    update: PropTypes.func.isRequired
  }

  state = getStateFromProps(this.props)

  componentWillReceiveProps (newProps) {
    this.setState(getStateFromProps(newProps))
  }

  onSelectorChange = ({feed, routes, trips}) => {
    const {update} = this.props
    update({
      feed,
      routes,
      trips
    })
  }

  selectFromStop = (e) => {
    this.props.setMapState({
      state: SINGLE_STOP_SELECTION,
      modification: this.props.modification,
      which: 'fromStop'
    })
  }

  selectToStop = (e) => {
    this.props.setMapState({
      state: SINGLE_STOP_SELECTION,
      modification: this.props.modification,
      which: 'toStop'
    })
  }

  editAlignment = (e) => {
    this.props.setMapState({
      state: ADD_STOPS,
      modificationId: this.props.modification.id,
      extendFromEnd: this.props.modification.toStop == null,
      followRoad: this.state.followRoad,
      // if one or the other end is free, allow extending the modification
      allowExtend: this.props.modification.toStop == null || this.props.modification.fromStop == null
    })
  }

  onFollowRoadChange = (e) => {
    this.props.setMapState({
      state: ADD_STOPS,
      modificationId: this.props.modification.id,
      extendFromEnd: this.props.modification.toStop == null,
      followRoad: e.target.checked,
      // if one or the other end is free, allow extending the modification
      allowExtend: this.props.modification.toStop == null || this.props.modification.fromStop == null
    })
  }

  stopEditingAlignment = (e) => {
    this.props.setMapState({
      state: null,
      modificationId: null
    })
  }

  setSpeed = (e) => {
    this.props.update({
      speed: parseInt(e.target.value, 10)
    })
  }

  setDwell = (e) => {
    this.props.update({
      dwell: parseInt(e.target.value, 10)
    })
  }

  /** toggle whether stops should be created automatically */
  onAutoCreateStopsChange = (e) => {
    const spacing = e.target.checked ? 400 : 0
    this.setState({...this.state, spacing})

    const {modification, update} = this.props
    update({segments: modification.segments.map((s) => ({...s, spacing}))})
  }

  /** set stop spacing */
  onStopSpacingChange = (e) => {
    const spacing = parseInt(e.target.value, 10)
    this.setState({...this.state, spacing})
    const spacingIsValid = spacing !== null && isNaN(spacing) && spacing >= 50
    if (spacingIsValid) { // user likely still typing
      const {modification, update} = this.props
      const {segments} = modification
      const currentSpacingIsNotZero = segments.length > 0 && segments[0].spacing > 0
      if (currentSpacingIsNotZero) {
        update({segments: segments.map((segment) => ({...segment, spacing}))})
      }
    }
  }

  setSpeedFromTravelTime = (e) => {
    const {lastStopDistanceFromStart, modification, stops, update} = this.props
    let nStops = stops.length
    // figure out appropriate speed given this travel time
    const travelTimeMinutes = parseFloat(e.target.value)
    const travelTimeIsValid = travelTimeMinutes !== null && !isNaN(travelTimeMinutes)
    if (travelTimeIsValid && nStops !== 0) {
      // don't include dwells at first and last stops
      if (modification.fromStop) nStops--
      if (modification.toStop) nStops--
      const totalDwellSeconds = nStops * modification.dwell
      const travelTimeSeconds = (travelTimeMinutes * 60) - totalDwellSeconds
      // figure out speed
      const speedMps = lastStopDistanceFromStart / travelTimeSeconds
      const speedKph = speedMps * 3600 / 1000
      update({speed: speedKph})
    }
  }

  render () {
    const {feeds, modification, totalTravelTimeMinutes} = this.props
    const {followRoad, isEditingAlignment, selectedFeed, spacing} = this.state

    // not using state here as otherwise checkbox would toggle on and off as you're editing the stop spacing
    const autoCreateStops = modification.segments.length > 0 ? modification.segments[0].spacing > 0 : true
    return (
      <div>
        <SelectFeedRouteAndPatterns
          feeds={feeds}
          onChange={this.onSelectorChange}
          routes={modification.routes}
          selectedFeed={selectedFeed}
          trips={modification.trips}
          />

        {this.renderStops()}

        <Number
          label='Speed (km/h)'
          onChange={this.setSpeed}
          value={modification.speed}
          />
        <Number
          label='Dwell time (seconds)'
          onChange={this.setDwell}
          step={1}
          value={modification.dwell}
        />
        <Number
          label='Travel time (mins)'
          onChange={this.setSpeedFromTravelTime}
          value={totalTravelTimeMinutes}
          />

        {isEditingAlignment &&
          <div>
            <Button
              block
              onClick={this.stopEditingAlignment}
              style='warning'
              ><Icon type='pencil' /> Stop editing alignment
            </Button>
            <Checkbox
              checked={followRoad}
              label={messages.transitEditor.followRoad}
              onChange={this.onFollowRoadChange}
              />
          </div>
        }
        {!isEditingAlignment &&
          <Button
            block
            onClick={this.editAlignment}
            style='warning'
            ><Icon type='pencil' /> Edit alignment
          </Button>
        }

        <Checkbox
          checked={autoCreateStops}
          label={messages.transitEditor.autoCreateStops}
          onChange={this.onAutoCreateStopsChange}
          />

        {autoCreateStops &&
          <Number
            value={spacing}
            label={messages.transitEditor.stopSpacingMeters}
            onChange={this.onStopSpacingChange}
            />
        }

      </div>
    )
  }

  renderStops () {
    const {modification} = this.props
    const {selectedFeed} = this.state
    const hasFeedAndRoutes = selectedFeed && modification.routes
    if (hasFeedAndRoutes) {
      const fromStopLabel = `From stop: ${modification.fromStop ? selectedFeed.stopsById[modification.fromStop].stop_name : '(none)'}`
      const toStopLabel = `To stop: ${modification.toStop ? selectedFeed.stopsById[modification.toStop].stop_name : '(none)'}`
      return (
        <div>
          <Group label={fromStopLabel}>
            <Button block onClick={this.selectFromStop} style='info'><Icon type='crosshairs' /> Select</Button>
          </Group>
          <Group label={toStopLabel}>
            <Button block onClick={this.selectToStop} style='info'><Icon type='crosshairs' /> Select</Button>
          </Group>
        </div>
      )
    }
  }
}

/** extract current stop spacing from a modification */
function getStateFromProps (props) {
  const {feedsById, mapState, modification} = props

  return {
    followRoad: mapState.followRoad,
    isEditingAlignment: mapState && mapState.modificationId === modification.id && mapState.state === ADD_STOPS,
    selectedFeed: feedsById[modification.feed],
    spacing: modification.segments.length > 0 ? modification.segments[0].spacing : 400
  }
}
