import useSWR from 'swr'

import {ResponseError} from 'lib/utils/safe-fetch'

const REFRESH_INTERVAL_MS = 10_000
const VERSION_URL = process.env.NEXT_PUBLIC_API_URL + '/version'

type Version = {
  branch: string
  commit: string
  version: string
}

export default function useApiVersion() {
  return useSWR<Version, ResponseError>(VERSION_URL, {
    refreshInterval: REFRESH_INTERVAL_MS,
    refreshWhenOffline: true,
    revalidateOnFocus: true
  })
}
