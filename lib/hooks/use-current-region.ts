import {useRegion} from './use-model'
import useRouterQuery from './use-router-query'

/**
 * The application is mostly used in the context of a single region whose ID is always present in the
 * URL. This helper function prevents the need to drill the `regionId` down into each component.
 */
export default function useCurrentRegion() {
  const response = useRegion(useCurrentRegionId())
  return response.data
}

export function useCurrentRegionId(): string {
  return useRouterQuery().regionId
}
