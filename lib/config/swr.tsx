import {SWRConfig, SWRConfiguration} from 'swr'

import {swrFetcher} from 'lib/utils/safe-fetch'

// Cypress runs tests quite fast and can run into the automatic deduping and throttling of requests.
const config: SWRConfiguration = {
  dedupingInterval: process.env.NEXT_PUBLIC_CYPRESS === 'true' ? 0 : 1_000, // default is 2_000 ms
  fetcher: swrFetcher,
  focusThrottleInterval: process.env.NEXT_PUBLIC_CYPRESS === 'true' ? 0 : 1_000 // default is 5_000 ms
}

// For utilizing SWR without revalidation
export const noRevalidateConfig: SWRConfiguration = {
  dedupingInterval: 30_000, // in milliseconds
  revalidateOnFocus: false,
  revalidateOnReconnect: false
}

// SWRConfig wrapper
export default function SWRWrapper({children}) {
  return <SWRConfig value={config}>{children}</SWRConfig>
}
