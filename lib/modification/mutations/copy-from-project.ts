import {postJSON} from 'lib/utils/safe-fetch'

const url = '/api/modification/copy-from-project'

export default function copyModificationsFromProject(
  fromProject: CL.Project,
  toProject: CL.Project
) {
  return postJSON(url, {
    fromProjectId: fromProject._id,
    fromBundleId: fromProject.bundleId,
    toProjectId: toProject._id,
    toProject: toProject.bundleId
  })
}
