import {getUser} from '../user'

import {safeFetch} from './safe-fetch'

/**
 * Fetch wrapper that includes authentication. Defaults to JSON.
 */
export default function authFetch(url: string, options?: RequestInit) {
  const user = getUser()
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: `bearer ${user.idToken}`
  }
  if (user.adminTempAccessGroup)
    headers['X-Conveyal-Access-Group'] = user.adminTempAccessGroup

  return safeFetch(url, {
    mode: 'cors',
    ...options,
    headers: {
      ...headers,
      ...options?.headers
    }
  })
}
