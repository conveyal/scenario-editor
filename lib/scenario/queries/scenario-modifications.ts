import {getJSON} from 'lib/utils/safe-fetch'

/**
 * Fetch the modifications ids in this scenario.
 */
export default function queryScenarioModifications(scenarioId: string) {
  const url = `/api/scenario/${scenarioId}/modification-ids`
  return getJSON<string[]>(url)
}
