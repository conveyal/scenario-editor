import useSWR from 'swr/immutable'

import {EMPTY_ARRAY} from 'lib/constants'
import {noRevalidateConfig} from 'lib/config/swr'
import useUser from 'lib/hooks/use-user'

import getBundleStops, {FeedStops} from '../queries/get-bundle-stops'

export default function useBundleStops(bundleId: string): FeedStops[] {
  const {user} = useUser()
  const key = () => (user == null ? null : [bundleId, user])
  const res = useSWR<FeedStops[]>(key, getBundleStops, noRevalidateConfig)
  return res.data ?? EMPTY_ARRAY
}
