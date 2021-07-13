import {API_URL} from 'lib/constants'
import authFetch from 'lib/utils/auth-fetch'

const toJSON = (response: Response) => response.json()

const fetchOptions: RequestInit = {
  cache: 'force-cache'
}

export type FeedStops = {
  feedId: string
  stops: GTFS.Stop[]
}

export default async function getBundleStops(bundleId: string, user: CL.User) {
  const url = `${API_URL}/gtfs/${bundleId}/stops`
  const res = await authFetch<FeedStops[]>(url, user, toJSON, fetchOptions)
  if (res.ok === false) throw res.error
  return res.data
}
