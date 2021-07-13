import {safeDelete} from 'lib/utils/safe-fetch'

/**
 * Delete this scenario
 */
export default function removeScenarioModifications(scenario: CL.Scenario) {
  const url = `/api/scenario/${scenario._id}/remove-references`
  return safeDelete(url)
}
