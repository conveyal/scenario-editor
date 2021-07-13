import gtfsFetch from '../gtfs-fetch'

export default async function getStops(
  bundleId: string,
  feedId: string,
  user: CL.User
) {
  const res = await gtfsFetch<GTFS.Stop[]>(bundleId, feedId, '/stops', user)
  if (res.ok === false) throw res.error
  return res.data
}
