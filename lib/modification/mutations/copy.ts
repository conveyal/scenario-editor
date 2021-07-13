import {postJSON} from 'lib/utils/safe-fetch'

export default function copyModification(_id: string) {
  const apiUrl = `/api/modification/${_id}/copy`
  return postJSON<any, {_id: string}>(apiUrl, {})
}
