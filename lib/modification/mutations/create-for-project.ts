import {postJSON} from 'lib/utils/safe-fetch'

/**
 * Create a modification for a specific project. Default values are added from that project (like the feed) and
 * scenario entries are created.
 */
export default function createModificationForProject(
  projectId: string,
  type: CL.ModificationTypes,
  name: string
) {
  const url = `/api/modification/create`
  return postJSON<CL.Modification>(url, {name, projectId, type})
}
