import {dequal} from 'dequal/lite'
import useSWR, {SWRResponse} from 'swr'
import {useCallback, useState} from 'react'

import {API} from 'lib/constants'
import {IUser} from 'lib/user'
import authFetch from 'lib/utils/auth-fetch'
import {ResponseError} from 'lib/utils/safe-fetch'
import useUser from './use-user'

const MAX_REFRESH_INTERVAL_MS = 30_000
const FAST_REFRESH_INTERVAL_MS = MAX_REFRESH_INTERVAL_MS / 10

/**
 * SWR expects errors to throw.
 */
async function swrFetcher(url: string, user: IUser) {
  const response = await authFetch<CL.Activity>(url, user)
  if (response.ok) return response.data
  throw response
}

/**
 * Fetch the status from the API server. Use a default refresh interval that speeds up 10x if
 * the data returned from the server has changed. If the data does not change, increase the interval
 * on each fetch until it returns to the default again.
 */
export default function useStatus(): SWRResponse<CL.Activity, ResponseError> {
  const user = useUser()
  const [refreshInterval, setRefreshInterval] = useState(
    MAX_REFRESH_INTERVAL_MS
  )
  const [prevData, setPrevData] = useState<CL.Activity | void>()
  const onSuccess = useCallback(
    (data) => {
      if (prevData == null) {
        setPrevData(data)
      } else if (!dequal(prevData, data)) {
        setPrevData(data)
        setRefreshInterval(FAST_REFRESH_INTERVAL_MS)
      } else {
        setRefreshInterval(
          (ri) =>
            ri + (ri < MAX_REFRESH_INTERVAL_MS ? FAST_REFRESH_INTERVAL_MS : 0)
        )
      }
    },
    [prevData]
  )
  return useSWR<CL.Activity, ResponseError>([API.Activity, user], swrFetcher, {
    onSuccess,
    refreshInterval,
    refreshWhenOffline: true,
    revalidateOnFocus: true,
    revalidateOnMount: true
  })
}
