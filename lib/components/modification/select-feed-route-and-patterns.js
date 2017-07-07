// @flow
import React, {PureComponent} from 'react'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'

import type {Feed} from '../../types'

type Props = {
  allowMultipleRoutes?: boolean,
  feeds: Feed[],
  onChange: ({
    feed: null | string,
    routes: null | string[],
    trips: null | string[]
  }) => void,
  routes: null | string[],
  routePatterns: Array<{
    name: string,
    pattern_id: string,
    trips: Array<{
      trip_id: string
    }>
  }>,
  selectedFeed: null | Feed,
  trips: null | string[] // trips can be null indicating a wildcard
}

/**
 * Select a (group of) patterns from the GTFS feed
 */
export default class SelectFeedRouteAndPatterns extends PureComponent<void, Props, void> {
  _selectTrips = ({patterns, trips}: {
    patterns: string[],
    trips: string[]
  }) => {
    const {selectedFeed, routes} = this.props
    this.props.onChange({feed: selectedFeed ? selectedFeed.id : null, routes, patterns, trips})
  }

  _selectFeedAndRoutes = ({feed, routes}: {
    feed: null | string,
    routes: null | string[]
  }) => {
    this.props.onChange({feed, routes, trips: null})
  }

  render () {
    const {
      allowMultipleRoutes,
      feeds,
      routePatterns,
      routes,
      selectedFeed,
      trips
    } = this.props
    return (
      <div>
        <SelectFeedAndRoutes
          allowMultipleRoutes={allowMultipleRoutes}
          feeds={feeds}
          onChange={this._selectFeedAndRoutes}
          selectedFeed={selectedFeed}
          selectedRouteIds={routes}
          />

        {routes && routes.length < 2 && routePatterns.length > 0 &&
          <SelectPatterns
            onChange={this._selectTrips}
            routePatterns={routePatterns}
            trips={trips}
            />
        }
      </div>
    )
  }
}
