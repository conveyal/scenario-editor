import gtfsFetch from '../gtfs-fetch'

export default async function getFeedRoutes(
  bundleId: string,
  feedId: string,
  user: CL.User
) {
  const res = await gtfsFetch<GTFS.Route[]>(bundleId, feedId, '/routes', user)
  if (res.ok === false) throw res.error
  return res.data
}
