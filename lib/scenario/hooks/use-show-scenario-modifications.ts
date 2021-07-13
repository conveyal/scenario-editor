import {useCallback} from 'react'
import useModificationsOnMap from 'lib/modification/hooks/use-modifications-on-map'

import queryScenarioModifications from '../queries/scenario-modifications'

export default function useShowScenarioModifications() {
  const {setAll} = useModificationsOnMap()
  return useCallback(
    async (scenario: CL.Scenario) => {
      const res = await queryScenarioModifications(scenario._id)
      if (res.ok === false) throw res.error
      setAll(scenario.projectId, res.data)
    },
    [setAll]
  )
}
