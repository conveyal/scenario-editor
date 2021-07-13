import gtfsFetch from '../gtfs-fetch'

export default async function getRoute(
  bundleId: string,
  feedId: string,
  routeId: string,
  user: CL.User
) {
  const path = `/routes/${routeId}`
  const res = await gtfsFetch<GTFS.Route>(bundleId, feedId, path, user)
  if (res.ok === false) throw res.error
  return res.data
}
