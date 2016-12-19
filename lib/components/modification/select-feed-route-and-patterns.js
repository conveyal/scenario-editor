/** Select a (group of) patterns from the GTFS feed */

import React, {Component, PropTypes} from 'react'

import SelectPatterns from './select-patterns'
import SelectFeedAndRoutes from './select-feed-and-routes'

export default class SelectFeedRouteAndPatterns extends Component {
  static propTypes = {
    feeds: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    routes: PropTypes.array,
    selectedFeed: PropTypes.object,
    trips: PropTypes.array // trips can be null indicating a wildcard
  }

  _selectTrips = ({trips}) => {
    const {selectedFeed, routes} = this.props
    this.props.onChange({feed: selectedFeed.id, routes, trips})
  }

  _selectFeedAndRoutes = ({feed, routes}) => {
    this.props.onChange({feed, routes, trips: null})
  }

  render () {
    const {selectedFeed, feeds, routes, trips} = this.props
    const routePatterns = getRoutePatterns({feed: selectedFeed, routes})
    return (
      <div>
        <SelectFeedAndRoutes
          feeds={feeds}
          onChange={this._selectFeedAndRoutes}
          selectedFeed={selectedFeed}
          selectedRouteId={routes && routes[0]}
          />

        {routePatterns &&
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

function getRoutePatterns ({feed, routes}) {
  return feed && routes && routes.length === 1
    ? feed.routesById[routes[0]].patterns
    : false
}
