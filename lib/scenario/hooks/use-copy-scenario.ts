import {useCallback} from 'react'

import {UseCollectionResponse} from 'lib/hooks/use-collection'

import copyScenario from '../mutations/copy-scenario'

export default function useCopyScenario(
  scenarios: UseCollectionResponse<CL.Scenario>
) {
  const {mutate} = scenarios.response

  return useCallback(
    async (scenario: CL.Scenario) => {
      const copyResponse = await copyScenario(scenario)
      if (copyResponse.ok === false) throw copyResponse.error
      await mutate()
    },
    [mutate]
  )
}
