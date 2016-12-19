/** Select routes or trips to remove */

import React, {Component, PropTypes} from 'react'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

export default class RemoveTrips extends Component {
  static propTypes = {
    feedsById: PropTypes.object.isRequired,
    feeds: PropTypes.array.isRequired,
    modification: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired
  }

  render () {
    const {feeds, feedsById, modification} = this.props
    const {feed, routes, trips} = modification
    return (
      <SelectFeedRouteAndPatterns
        feeds={feeds}
        onChange={this.props.update}
        routes={routes}
        selectedFeed={feedsById[feed]}
        trips={trips}
        />
    )
  }
}
