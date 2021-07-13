import gtfsFetch from '../gtfs-fetch'

export default async function getRouteTrips(
  bundleId: string,
  feedId: string,
  routeId: string,
  user: CL.User
) {
  const path = `/routes/${routeId}/trips`
  const res = await gtfsFetch<GTFS.Trip[]>(bundleId, feedId, path, user)
  if (res.ok === false) throw res.error
  return res.data
}
