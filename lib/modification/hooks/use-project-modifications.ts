import {useCurrentProjectId} from 'lib/hooks/use-current-project'
import {useModifications} from 'lib/hooks/use-collection'

export default function useProjectModifications() {
  const projectId = useCurrentProjectId()
  const {data: modifications} = useModifications({
    query: {projectId}
  })
  return modifications
}
