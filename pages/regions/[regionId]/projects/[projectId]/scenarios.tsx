import {
  useModifications,
  useScenarios,
  useScenariosModifications
} from 'lib/hooks/use-collection'
import {useProject} from 'lib/hooks/use-model'
import withDataLayout from 'lib/hocs/with-data-layout'

export default withDataLayout<{
  modifications: CL.Modification[]
  project: CL.Project
  scenarios: CL.Scenario[]
  scenariosModifications: CL.ScenariosModifications[]
}>(
  function ScenariosPage() {
    return null
  },
  function useData(p) {
    const {projectId} = p.query
    const scenarios = useScenarios({query: {projectId}})
    return {
      modifications: useModifications({
        query: {projectId},
        options: {projection: {name: 1}}
      }),
      project: useProject(projectId),
      scenarios,
      scenariosModifications: useScenariosModifications({
        query: {
          scenarioId: {
            $in: scenarios.data.map((s) => s._id)
          }
        }
      })
    }
  }
)
