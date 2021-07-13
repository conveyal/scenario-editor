import message from 'lib/message'

import {UNDEFINED_PROJECT_NAME} from '../constants'

const baselineName: string = message('scenario.baseline')

/**
 * Remove special characters from the name in order to use as file names.
 */
export default function cleanProjectScenarioName(
  project?: CL.Project,
  scenarioName = baselineName
) {
  if (!project) {
    return UNDEFINED_PROJECT_NAME
  }
  const description = `${project.name}-${scenarioName}`
  return description.replace(/[^a-zA-Z0-9]/, '-')
}
