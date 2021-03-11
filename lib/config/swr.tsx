import {SWRConfig, SWRConfiguration} from 'swr'

import {swrFetcher} from 'lib/utils/safe-fetch'

const config: SWRConfiguration = {fetcher: swrFetcher}

// SWRConfig wrapper
export default function SWRWrapper({children}) {
  return <SWRConfig value={config}>{children}</SWRConfig>
}
