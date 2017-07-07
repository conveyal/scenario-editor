/** use the graphql api to get data needed for modifications */

import fetch from '@conveyal/woonerf/fetch'

import {lockUiWithError, setFeeds} from './'
import {
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from '../constants'
import * as query from '../graphql/query'

let currentBundleId = null // TODO this should be handled more gracefully
let fetchedFeeds = null

export default function getFeedsRoutesAndStops ({
  bundleId,
  forceCompleteUpdate = false,
  modifications = []
}) {
  const routeIds = getUniqueRouteIdsFromModifications(modifications)
  const shouldGetAllRoutesAndStops = forceCompleteUpdate || bundleId !== currentBundleId || Object.keys(fetchedFeeds || {}).length === 0
  currentBundleId = bundleId
  if (shouldGetAllRoutesAndStops) {
    return getAllRoutesAndStops({bundleId, routeIds})
  } else {
    return getUnfetchedRoutes({bundleId, routeIds})
  }
}

function getAllRoutesAndStops ({
  bundleId,
  routeIds
}) {
  return fetch({
    url: query.compose(query.data, {bundleId, routeIds}),
    next (error, response) {
      if (!error) {
        const json = response.value

        // make sure the bundle ID hasn't changed in the meantime from a concurrent request
        if (bundleId === currentBundleId) {
          fetchedFeeds = []
          if (json.bundle && json.bundle.length > 0) {
            json.bundle[0].feeds.forEach((feed) => {
              let {checksum, detailRoutes, feed_id, routes, stops} = feed
              routes = routes.map(labelRoute)
              detailRoutes = detailRoutes.map(labelRoute)

              const routesById = {}
              const addToRoutes = (route) => { routesById[route.route_id] = route }
              routes.forEach(addToRoutes)
              // detailRoutes will overwrite less detailed routes
              detailRoutes.forEach(addToRoutes)

              const stopsById = {}
              stops.forEach((stop) => { stopsById[stop.stop_id] = stop })
              fetchedFeeds.push({
                id: feed_id,
                routes: Object.values((routesById)).sort(routeSorter),
                routesById,
                stops,
                stopsById,
                checksum
              })
            })
          }

          return setFeeds(fetchedFeeds)
        }
      }
    }
  })
}

function getUnfetchedRoutes ({
  bundleId,
  routeIds
}) {
  // partial fetch, fetch only routes that are not already fetched.
  const unfetchedRouteIds = getUnfetchedRouteIds({fetchedFeeds, routeIds})
  // no routes found that haven't been fetched
  if (unfetchedRouteIds.length > 0) {
    return fetch({
      url: query.compose(query.route, {bundleId, routeIds}),
      next (error, response) {
        if (!error) {
          const json = response.value
          // if another request has changed the bundle out from under us, bail
          if (bundleId === currentBundleId) {
            if (json.bundle && json.bundle.length > 0) {
              json.bundle[0].feeds.forEach((feed) => {
                const index = fetchedFeeds.findIndex((f) => f.id === feed.feed_id)
                const fetchedFeed = fetchedFeeds[index]
                fetchedFeed.routesById = {...fetchedFeed.routesById}
                feed.routes.forEach((route) => {
                  fetchedFeed.routesById[route.route_id] = labelRoute(route)
                })
                fetchedFeed.routes = Object.values(fetchedFeed.routesById).sort(routeSorter)
                fetchedFeeds[index] = {...fetchedFeed}
              })

              return setFeeds([...fetchedFeeds])
            } else {
              return lockUiWithError('No bundles were returned.')
            }
          }
        }
      }
    })
  }
}

function labelRoute (r) {
  r.label = getRouteLabel(r)
  return r
}

function getRouteLabel (r) {
  return (r.route_short_name ? r.route_short_name + ' ' : '') + (r.route_long_name ? r.route_long_name : '')
}

function routeSorter (r0, r1) {
  const name0 = r0.route_short_name ? r0.route_short_name : r0.route_long_name
  const name1 = r1.route_short_name ? r1.route_short_name : r1.route_long_name

  // if name0 is e.g. 35 Mountain View Transit Center, parseInt will return 35, stripping the text
  const num0 = parseInt(name0, 10)
  const num1 = parseInt(name1, 10)

  if (!isNaN(num0) && !isNaN(num1)) return num0 - num1
  // numbers before letters
  else if (!isNaN(num0) && isNaN(num1)) return -1
  else if (isNaN(num0) && !isNaN(num1)) return 1

  // no numbers, sort by name
  else if (name0 < name1) return -1
  else if (name0 === name1) return 0
  else return 1
}

function getUniqueRouteIdsFromModifications (modifications) { // TODO: this can be done at the reducer
  // for every route referenced in the scenario we get the patterns
  const routeIds = []
  for (const modification of modifications) {
    if (modification.type === REMOVE_TRIPS ||
      modification.type === REMOVE_STOPS ||
      modification.type === ADJUST_SPEED ||
      modification.type === ADJUST_DWELL_TIME ||
      modification.type === CONVERT_TO_FREQUENCY ||
      modification.type === REROUTE) {
      // NB we are in fact getting all routes in every feed that have this route ID, which means we're pulling down a bit more data than we need to but it's pretty benign
      if (modification.routes !== null) {
        // TODO This needs to be optimized on the server side. Currently only
        // Adjust Speed modifications can have more than one route so they will
        // *not* all be displayed on the screen. Only the first one.
        const routeId = modification.routes[0]
        if (routeIds.indexOf(routeId) === -1) {
          routeIds.push(routeId)
        }
      }
    }
  }

  return routeIds
}

function getUnfetchedRouteIds ({
  fetchedFeeds,
  routeIds
}) {
  return routeIds.filter((r) => {
    return Object.values(fetchedFeeds).find((feed) => {
      return feed.routesById[r] && feed.routesById[r].patterns != null
    }) == null
  })
}
