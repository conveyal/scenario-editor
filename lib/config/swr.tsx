import {SWRConfig} from 'swr'

import {swrFetcher} from 'lib/utils/safe-fetch'

const config = {fetcher: swrFetcher}

// SWRConfig wrapper
export default function SWRWrapper({children}) {
  return <SWRConfig value={config}>{children}</SWRConfig>
}
