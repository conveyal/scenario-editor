import useSWR from 'swr'

import {API_URL} from 'lib/constants'
import authFetch from 'lib/utils/auth-fetch'
import {ResponseError} from 'lib/utils/safe-fetch'

const REFRESH_INTERVAL_MS = 10_000
const ACTIVITY_URL = API_URL + '/activity'

async function swrFetcher(url: string) {
  const response = await authFetch<CL.Status>(url)
  if (response.ok) return response.data
  throw response
}

export default function useStatus() {
  return useSWR<CL.Status, ResponseError>(ACTIVITY_URL, swrFetcher, {
    refreshInterval: REFRESH_INTERVAL_MS,
    refreshWhenOffline: true,
    revalidateOnFocus: true
  })
}
