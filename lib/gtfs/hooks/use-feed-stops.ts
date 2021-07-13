import useBundleStops from './use-bundle-stops'

import {EMPTY_ARRAY} from 'lib/constants'

export default function useStops(
  bundleId: string,
  feedId: string
): GTFS.Stop[] {
  const bundleStops = useBundleStops(bundleId)
  return bundleStops.find((b) => b.feedId === feedId)?.stops ?? EMPTY_ARRAY
}
