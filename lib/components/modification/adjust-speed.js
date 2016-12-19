/**
 * Adjust speed on a route
 */

import React, { Component, PropTypes } from 'react'

import {Button, Group} from '../buttons'
import {Group as FormGroup, Number} from '../input'
import {HOP_SELECTION} from '../scenario-map/state'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

export default class AdjustSpeed extends Component {
  static propTypes = {
    feeds: PropTypes.array.isRequired,
    feedsById: PropTypes.object.isRequired,
    modification: PropTypes.object.isRequired,
    replaceModification: PropTypes.func.isRequired,
    setMapState: PropTypes.func.isRequired
  }

  onSelectorChange = (value) => {
    let {feed, routes, trips} = value
    let modification = Object.assign({}, this.props.modification, { feed, routes, trips, hops: null })
    this.props.replaceModification(modification)
  }

  newSelection = (e) => {
    const {modification, setMapState} = this.props
    setMapState({
      state: HOP_SELECTION,
      modification,
      action: 'new'
    })
  }

  addToSelection = (e) => {
    const {modification, setMapState} = this.props
    setMapState({
      state: HOP_SELECTION,
      modification,
      action: 'add'
    })
  }

  removeFromSelection = (e) => {
    const {modification, setMapState} = this.props
    setMapState({
      state: HOP_SELECTION,
      modification,
      action: 'remove'
    })
  }

  clearSegment = (e) => {
    this.props.replaceModification({...this.props.modification, hops: null})
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  setScale = (e) => {
    this.props.replaceModification({...this.props.modification, scale: e.target.value})
  }

  render () {
    const {feeds, feedsById, modification} = this.props
    return (
      <form>
        <SelectFeedRouteAndPatterns
          feeds={feeds}
          onChange={this.onSelectorChange}
          routes={modification.routes}
          selectedFeed={feedsById[modification.feed]}
          trips={modification.trips}
          />

        {modification.routes &&
          <FormGroup>
            <label>Segment</label>
            <Group justified>
              <Button onClick={this.newSelection}>Select</Button>
              <Button onClick={this.addToSelection}>Add to</Button>
              <Button onClick={this.removeFromSelection}>Remove from</Button>
              <Button onClick={this.clearSegment}>Clear</Button>
            </Group>
          </FormGroup>
        }

        <Number
          label='Scale'
          name='Scale'
          onChange={this.setScale}
          step='any'
          value={modification.scale}
          />
      </form>
    )
  }
}
