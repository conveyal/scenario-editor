import {API} from 'lib/constants'

export function compose(query, variables) {
  return `${API.GraphQL}?query=${encodeURIComponent(
    query
  )}&variables=${encodeURIComponent(JSON.stringify(variables))}`
}

export const data = `
query dataQuery($bundleId: String, $routeIds: [String]) {
  bundle (bundle_id: [$bundleId]) {
    feeds {
      feed_id,
      checksum,
      routes {
        route_id
        route_short_name
        route_long_name
      }

      detailRoutes: routes(route_id: $routeIds) {
        route_id
        route_short_name
        route_long_name
        patterns {
          name,
          pattern_id,
          geometry,
          trips {
            trip_id,
            trip_short_name,
            trip_headsign,
            start_time,
            direction_id,
            duration
          },
          stops {
            stop_id
          }
        }
      }

      stops {
        stop_id,
        stop_name,
        stop_lat,
        stop_lon
      }
    }
  }
}
`

/**
 * Query to get detailed information on a particular route
 */
export const route = `
query routeQuery($bundleId: String, $routeIds: [String]) {
  bundle (bundle_id: [$bundleId]) {
    feeds {
      feed_id,
      checksum,
      routes(route_id: $routeIds) {
        route_id
        route_short_name
        route_long_name
        patterns {
          name,
          pattern_id,
          geometry,
          trips {
            trip_id,
            trip_short_name,
            trip_headsign,
            start_time,
            direction_id,
            duration
          },
          stops {
            stop_id
          }
        }
      }
      stops {
        stop_id,
        stop_name,
        stop_lat,
        stop_lon
      }
    }
  }
}`
