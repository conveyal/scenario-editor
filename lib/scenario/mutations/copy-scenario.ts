import {postJSON} from 'lib/utils/safe-fetch'

export default function copyScenario(scenario: CL.Scenario) {
  const url = `/api/scenario/${scenario._id}/copy`
  return postJSON<CL.Scenario>(url, {_id: scenario._id})
}
