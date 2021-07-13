// TODO: Should this be done as a selector?

export function getPatternsForModification({
  activeTrips = [],
  dim = false,
  feed,
  modification
}) {
  const feedLoaded = !!feed
  const routesHaveBeenChosen =
    !!modification.routes && modification.routes.length > 0

  if (feedLoaded && routesHaveBeenChosen) {
    const patterns = modification.routes.reduce(
      (allPatterns, route) => [
        ...allPatterns,
        ...(feed.routes.find((r) => r.route_id === route).patterns || [])
      ],
      []
    )
    const patternsLoaded = !!patterns
    if (patternsLoaded) {
      return filterPatterns({activeTrips, dim, modification, patterns})
    }
  }
}

function filterPatterns({
  activeTrips,
  dim, // TODO: dim shouldn't be passed this low
  modification,
  patterns
}) {
  // handle inchoate modifications that do not yet have patterns
  if (modification.trips == null && modification.entries == null) {
    return patterns // or return [] ?
  }

  // Some modification types (convert-to-frequency) don't have trips/patterns
  // specified at the modification level, so .trips is undefined, not null
  if (
    modification.trips !== null &&
    modification.type !== 'convert-to-frequency'
  ) {
    return patterns.filter(
      (pat) =>
        pat.trips.findIndex((t) => modification.trips.indexOf(t.trip_id) > -1) >
        -1
    )
  }

  if (!dim && activeTrips && activeTrips.length > 0) {
    return patterns.filter(
      (pat) =>
        pat.trips.findIndex((t) => activeTrips.indexOf(t.trip_id) > -1) > -1
    )
  }

  return filterSelectedPatterns({modification, patterns})
}

function filterSelectedPatterns({modification, patterns}) {
  const selectedTrips = modification.entries.reduce(
    (all, e) => all.concat(e.patternTrips || []),
    []
  )
  if (selectedTrips.length > 0) {
    return patterns.filter(
      (pat) =>
        pat.trips.findIndex((t) => selectedTrips.indexOf(t.trip_id) > -1) > -1
    )
  } else {
    return patterns
  }
}
