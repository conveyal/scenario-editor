import {useCurrentProjectId} from 'lib/hooks/use-current-project'
import {
  useModifications,
  useScenariosModifications
} from 'lib/hooks/use-collection'

/**
 * Get all the modifications for a given scenario.
 */
export default function useModificationsForScenario(scenarioId: string) {
  const projectId = useCurrentProjectId()
  const {data: modifications} = useModifications({query: {projectId}})
  const {data: scenariosModifications} = useScenariosModifications({
    query: {scenarioId}
  })

  return scenariosModifications.map((modification) =>
    modifications.find((m) => m._id === modification._id)
  )
}
