import {useProject} from './use-model'
import useRouterQuery from './use-router-query'

/**
 * When editing modifications, the application is used in the context of a single project whose ID is always present in the
 * URL. This helper function prevents the need to drill the `projectId` down into each component.
 */
export default function useCurrentProject() {
  const response = useProject(useCurrentProjectId())
  return response.data
}

export function useCurrentProjectId(): string {
  return useRouterQuery().projectId
}
