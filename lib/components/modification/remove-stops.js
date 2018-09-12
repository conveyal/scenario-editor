// @flow
import React, {Component} from 'react'

import {Number as InputNumber} from '../input'
import messages from '../../utils/messages'
import type {Feed, Modification, RoutePatterns, Stop} from '../../types'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

type Props = {
  feeds: Feed[],
  modification: Modification,
  routePatterns: RoutePatterns,
  routeStops: Stop[],
  selectedFeed: Feed,
  selectedStops: Stop[],
  setMapState: any,
  update(any): void,
  updateAndRetrieveFeedData: (any) => void
}

/**
 * Remove stops from a route
 */
export default class RemoveStopsComponent extends Component<void, Props, void> {
  onPatternSelectorChange = ({
    feed,
    routes,
    trips
  }: {
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => {
    this.props.updateAndRetrieveFeedData({
      feed,
      routes,
      trips,
      stops: []
    })
  }

  changeRemoveSeconds = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const {update} = this.props
    const secondsSavedAtEachStop = e.target.value
    update({secondsSavedAtEachStop})
  }

  render () {
    const {
      feeds,
      modification,
      routePatterns,
      routeStops,
      selectedFeed,
      selectedStops,
      setMapState,
      update
    } = this.props
    return (
      <form>
        <SelectFeedRouteAndPatterns
          feeds={feeds}
          onChange={this.onPatternSelectorChange}
          routePatterns={routePatterns}
          routes={modification.routes}
          selectedFeed={selectedFeed}
          trips={modification.trips}
        />

        {modification.routes &&
          selectedFeed &&
          <SelectStops
            modification={modification}
            routeStops={routeStops}
            selectedStops={selectedStops}
            setMapState={setMapState}
            update={update}
          />}

        <InputNumber
          label={messages.modification.removeStops.removeSeconds}
          units={messages.report.units.second}
          onChange={this.changeRemoveSeconds}
          value={modification.secondsSavedAtEachStop}
        />
      </form>
    )
  }
}
