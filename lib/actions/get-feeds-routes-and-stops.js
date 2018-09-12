// @flow
import fetch from '@conveyal/woonerf/fetch'
import uniqBy from 'lodash/uniqBy'

import {
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from '../constants'
import * as query from '../graphql/query'
import type {Modification} from '../types'

import {lockUiWithError, setFeeds} from './'

let currentBundleId = null // TODO this should be handled more gracefully
let fetchedFeeds = []

/** use the graphql api to get data needed for modifications */
export default function getFeedsRoutesAndStops ({
  bundleId,
  forceCompleteUpdate = false,
  modifications = []
}: {
  bundleId: string,
  forceCompleteUpdate?: boolean,
  modifications?: Modification[]
}) {
  const routeIds = getUniqueRouteIdsFromModifications(modifications)
  const shouldGetAllRoutesAndStops =
    forceCompleteUpdate ||
    bundleId !== currentBundleId ||
    fetchedFeeds.length === 0
  currentBundleId = bundleId
  if (shouldGetAllRoutesAndStops) {
    return getAllRoutesAndStops({bundleId, routeIds})
  } else {
    return getUnfetchedRoutes({bundleId, routeIds})
  }
}

function getAllRoutesAndStops ({bundleId, routeIds}) {
  return fetch({
    url: query.compose(query.data, {bundleId, routeIds}),
    next (response) {
      const json = response.value

      // make sure the bundle ID hasn't changed in the meantime from a concurrent request
      if (bundleId === currentBundleId) {
        fetchedFeeds = []
        if (json.bundle && json.bundle.length > 0) {
          json.bundle[0].feeds.forEach(feed => {
            const detailRoutes: any[] = feed.detailRoutes
            const routes: any[] = feed.routes
              .map((r) => detailRoutes.find((d) => d.route_id === r.route_id) || r)
              .map(labelRoute)
              .sort(routeSorter)

            const stopsById = {}
            feed.stops.forEach(s => { stopsById[s.stop_id] = s })

            fetchedFeeds.push({
              id: feed.feed_id,
              routes,
              stops: feed.stops,
              stopsById,
              checksum: feed.checksum
            })
          })
        }

        return setFeeds(fetchedFeeds)
      }
    }
  })
}

function getUnfetchedRoutes ({bundleId, routeIds}) {
  // partial fetch, fetch only routes that are not already fetched.
  const unfetchedRouteIds = getUnfetchedRouteIds({fetchedFeeds, routeIds})
  // no routes found that haven't been fetched
  if (unfetchedRouteIds.length > 0) {
    return fetch({
      url: query.compose(query.route, {bundleId, routeIds}),
      next (response) {
        const json = response.value
        // if another request has changed the bundle out from under us, bail
        if (bundleId === currentBundleId) {
          if (json.bundle && json.bundle.length > 0) {
            json.bundle[0].feeds.forEach(feed => {
              const index = fetchedFeeds.findIndex(f => f.id === feed.feed_id)
              const fetchedFeed = {...fetchedFeeds[index]}
              fetchedFeeds[index] = {
                ...fetchedFeed,
                routes: uniqBy([...feed.routes, ...fetchedFeed.routes], 'route_id')
                  .map(labelRoute)
                  .sort(routeSorter)
              }
            })

            return setFeeds([...fetchedFeeds])
          } else {
            return lockUiWithError('No bundles were returned.')
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
  return (
    (r.route_short_name ? r.route_short_name + ' ' : '') +
    (r.route_long_name ? r.route_long_name : '')
  )
}

function routeSorter (r0, r1) {
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

function getUniqueRouteIdsFromModifications (modifications) {
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

function getUnfetchedRouteIds ({fetchedFeeds, routeIds}) {
  return routeIds.filter(id => {
    return (
      fetchedFeeds.find(feed => {
        const route = feed.routes.find((r) => r.route_id === id)
        return route && route.patterns != null
      }) == null
    )
  })
}
