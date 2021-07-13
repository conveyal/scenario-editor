import gtfsFetch from '../gtfs-fetch'

export default async function getRouteStops(
  bundleId: string,
  feedId: string,
  routeId: string,
  user: CL.User
) {
  const path = `/routes/${routeId}/stops`
  const res = await gtfsFetch<GTFS.Stop[]>(bundleId, feedId, path, user)
  if (res.ok === false) throw res.error
  return res.data
}
