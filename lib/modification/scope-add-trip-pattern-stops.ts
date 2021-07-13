export default function scopeAddTripPatternStops(
  modification: CL.AddTripPattern,
  bundleStops: GTFS.FeedStops[]
): GTFS.FeedScopedStop[] {
  const stopIds: string[] = []
  for (const segment of modification.segments) {
    if (segment.fromStopId) stopIds.push(segment.fromStopId)
    if (segment.toStopId) stopIds.push(segment.toStopId)
  }
  return stopIds.map((scopedId) => {
    const [feedId, stopId] = scopedId.split(':')
    const feedStops = bundleStops.find((bs) => bs.feedId === feedId)?.stops
    const stop = feedStops.find((s) => s.id === stopId)
    return {
      feedId,
      scopedId,
      ...stop
    }
  })
}
