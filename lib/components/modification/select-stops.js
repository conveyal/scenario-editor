/** select stops on a particular route */

import React, {Component, PropTypes} from 'react'

import {STOP_SELECTION} from '../scenario-map/state'

export default class SelectStops extends Component {
  static propTypes = {
    feed: PropTypes.object.isRequired,
    modification: PropTypes.object.isRequired,
    nullIsWildcard: PropTypes.bool,
    setMapState: PropTypes.func,
    update: PropTypes.func.isRequired
  }

  state = {
    stops: getRouteStops(this.props)
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      ...this.state,
      stops: getRouteStops(newProps)
    })
  }

  newSelection = (e) => {
    e.preventDefault()
    const {modification, setMapState} = this.props
    setMapState({
      state: STOP_SELECTION,
      action: 'new',
      modification,
      routeStops: this.state.stops
    })
  }

  addToSelection = (e) => {
    e.preventDefault()
    const {modification, setMapState} = this.props
    setMapState({
      state: STOP_SELECTION,
      action: 'add',
      modification,
      routeStops: this.state.stops
    })
  }

  removeFromSelection = (e) => {
    e.preventDefault()
    const {modification, setMapState} = this.props
    setMapState({
      state: STOP_SELECTION,
      action: 'remove',
      modification,
      routeStops: this.state.stops
    })
  }

  clearSelection = (e) => {
    e.preventDefault()
    this.props.update({stops: null})
  }

  render () {
    const {feed, modification} = this.props
    const stopIds = modification.stops || []
    return <div>
      <div className='form-group'>
        <label>Selection</label>
        <div className='btn-group btn-group-justified'>
          <a className='btn btn-sm btn-default' onClick={this.newSelection}>New</a>
          <a className='btn btn-sm btn-default' onClick={this.addToSelection}>Add to</a>
          <a className='btn btn-sm btn-default' onClick={this.removeFromSelection}>Remove from</a>
          <a className='btn btn-sm btn-default' onClick={this.clearSelection}>Clear</a>
        </div>
      </div>
      {feed && <SelectedStops selectedStops={stopIds.map(getStopFromFeed(feed))} />}
    </div>
  }
}

// TODO: This utility function should live outside of this component
function getRouteStops ({
  feed,
  modification
}) {
  if (feed && modification && modification.routes && feed.routesById[modification.routes[0]].patterns) {
    const route = feed.routesById[modification.routes[0]]
    const patterns = modification.trips
      ? route.patterns.filter(patternTripsInModification(modification))
      : route.patterns

    return collectUniqueRouteStopIds(patterns).map(getStopFromFeed(feed))
  } else {
    return []
  }
}

const patternTripsInModification = (m) => (p) => p.trips.find((t) => m.trips.indexOf(t.trip_id) > -1)

function collectUniqueRouteStopIds (patterns) {
  const stopIds = []
  patterns.forEach((pattern) => {
    pattern.stops.forEach((s) => {
      if (stopIds.indexOf(s.stop_id) === -1) stopIds.push(s.stop_id)
    })
  })
  return stopIds
}

function SelectedStops ({selectedStops}) {
  return <ul>{selectedStops.map((stop) => <li data-id={stop.stop_id} key={stop.stop_id}>{stop.stop_name}</li>)}</ul>
}

const getStopFromFeed = (feed) => (stopId) => feed.stopsById[stopId]
