import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'

import {
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from 'lib/constants'
import * as query from 'lib/graphql/query'

import {setFeeds} from './'
import fetch from './fetch'

/**
 * Use the graphql api to get data needed for modifications.
 */
export default function getFeedsRoutesAndStops({
  bundleId,
  forceCompleteUpdate = false,
  modifications = []
}) {
  return async function(dispatch, getState) {
    const fetchedFeeds = get(getState(), 'project.feeds', [])

    const routeIds = getUniqueRouteIdsFromModifications(modifications)
    const shouldGetAllRoutesAndStops =
      forceCompleteUpdate || fetchedFeeds.length === 0

    if (shouldGetAllRoutesAndStops) {
      const json = await dispatch(
        fetch({
          url: query.compose(query.data, {bundleId, routeIds})
        })
      )
      const feeds = get(json, 'bundle[0].feeds', []).map(labelAndSortFeed)
      dispatch(setFeeds(feeds))
      return feeds
    } else {
      const unfetchedRouteIds = getUnfetchedRouteIds({fetchedFeeds, routeIds})
      if (unfetchedRouteIds.length > 0) {
        const json = await dispatch(
          fetch({
            url: query.compose(query.route, {
              bundleId,
              routeIds: unfetchedRouteIds
            })
          })
        )
        get(json, 'bundle[0].feeds', []).forEach(feed => {
          const index = fetchedFeeds.findIndex(f => f.id === feed.feed_id)
          const fetchedFeed = {...fetchedFeeds[index]}
          fetchedFeeds[index] = {
            ...fetchedFeed,
            routes: uniqBy([...feed.routes, ...fetchedFeed.routes], 'route_id')
              .map(labelRoute)
              .sort(routeSorter)
          }
        })
        dispatch(setFeeds(fetchedFeeds))
      }
    }

    return fetchedFeeds
  }
}

function labelAndSortFeed(feed) {
  const {checksum, stops} = feed
  const detailRoutes = feed.detailRoutes
  const routes = feed.routes
    .map(r => detailRoutes.find(d => d.route_id === r.route_id) || r)
    .map(labelRoute)
    .sort(routeSorter)

  const stopsById = {}
  stops.forEach(s => {
    stopsById[s.stop_id] = s
  })

  return {
    id: feed.feed_id,
    routes,
    stops,
    stopsById,
    checksum
  }
}

function labelRoute(r) {
  r.label = getRouteLabel(r)
  return r
}

function getRouteLabel(r) {
  return (
    (r.route_short_name ? r.route_short_name + ' ' : '') +
    (r.route_long_name ? r.route_long_name : '')
  )
}

function routeSorter(r0, r1) {
  const name0 = r0.route_short_name ? r0.route_short_name : r0.route_long_name
  const name1 = r1.route_short_name ? r1.route_short_name : r1.route_long_name

  // if name0 is e.g. 35 Mountain View Transit Center, parseInt will return 35, stripping the text
  const num0 = parseInt(name0, 10)
  const num1 = parseInt(name1, 10)

  if (!isNaN(num0) && !isNaN(num1)) return num0 - num1
  else if (!isNaN(num0) && isNaN(num1)) {
    // numbers before letters
    return -1
  } else if (isNaN(num0) && !isNaN(num1)) return 1
  else if (name0 < name1) {
    // no numbers, sort by name
    return -1
  } else if (name0 === name1) return 0
  else return 1
}

function getUniqueRouteIdsFromModifications(modifications) {
  // TODO: this can be done at the reducer
  // for every route referenced in the project we get the patterns
  const routeIds = []
  for (const modification of modifications) {
    if (
      modification.type === REMOVE_TRIPS ||
      modification.type === REMOVE_STOPS ||
      modification.type === ADJUST_SPEED ||
      modification.type === ADJUST_DWELL_TIME ||
      modification.type === CONVERT_TO_FREQUENCY ||
      modification.type === REROUTE
    ) {
      // NB we are in fact getting all routes in every feed that have this route
      // ID, which means we're pulling down a bit more data than we need to but
      // it's pretty benign
      if (modification.routes && modification.routes.length > 0) {
        // TODO To safely show multiple route, we need to add features to the
        // backend. The current implementation, displaying all patterns
        // individually, will crash browsers if used for a large number of
        // routes. So for the moment, we only display patterns for one route per
        // modification.
        const routeId = modification.routes[0]
        if (routeIds.indexOf(routeId) === -1) {
          routeIds.push(routeId)
        }
      }
    }
  }

  return routeIds
}

function getUnfetchedRouteIds({fetchedFeeds, routeIds}) {
  return routeIds.filter(id => {
    return (
      fetchedFeeds.find(feed => {
        const route = feed.routes.find(r => r.route_id === id)
        return route && route.patterns != null
      }) == null
    )
  })
}
