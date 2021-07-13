import gtfsFetch from '../gtfs-fetch'

export default async function getRoutePatterns(
  bundleId: string,
  feedId: string,
  routeId: string,
  user: CL.User
) {
  const path = `/routes/${routeId}/patterns`
  const res = await gtfsFetch<GTFS.Pattern[]>(bundleId, feedId, path, user)
  if (res.ok === false) throw res.error
  return res.data
}
