import Report from 'lib/components/report'
import withData from 'lib/hocs/with-data'
import {useProject, useScenario} from 'lib/hooks/use-model'

import withAuth from 'lib/with-auth'

export default withAuth(
  withData<{
    project: CL.Project
    scenario: CL.Scenario
  }>(
    function ReportPage({project, scenario}) {
      return <Report project={project} scenario={scenario} />
    },
    function useData({query}) {
      return {
        project: useProject(query.projectId),
        scenario: useScenario(query.scenarioId)
      }
    }
  )
)
