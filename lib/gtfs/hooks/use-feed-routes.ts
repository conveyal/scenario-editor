import {Key} from 'swr'
import useSWR from 'swr/immutable'

import {EMPTY_ARRAY} from 'lib/constants'
import {noRevalidateConfig} from 'lib/config/swr'
import useUser from 'lib/hooks/use-user'

import getFeedRoutes from '../queries/get-feed-routes'

const hasNull = (a: unknown[]) => a.findIndex((v) => v == null) !== -1

/**
 * Fetch a single route for a given feed group id, feed id, and route id.
 */
export default function useFeedRoutes(
  bundleId: string,
  feedId: string
): GTFS.Route[] {
  const {user} = useUser()
  const keyGroup = [bundleId, feedId, user]
  const key: Key = () => (hasNull(keyGroup) ? null : keyGroup)
  const response = useSWR<GTFS.Route[], Error>(
    key,
    getFeedRoutes,
    noRevalidateConfig
  )
  return response.data ?? EMPTY_ARRAY
}
